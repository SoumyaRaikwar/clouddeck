package services

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type KubernetesService struct {
	clientset *kubernetes.Clientset
}

type PodInfo struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Status    string `json:"status"`
	Restarts  int32  `json:"restarts"`
	Age       string `json:"age"`
	Node      string `json:"node"`
	IP        string `json:"ip"`
	Image     string `json:"image"`
	CPURequest string `json:"cpu_request"`
	MemRequest string `json:"mem_request"`
}

type DeploymentInfo struct {
	Name          string `json:"name"`
	Namespace     string `json:"namespace"`
	Replicas      int32  `json:"replicas"`
	ReadyReplicas int32  `json:"ready_replicas"`
	UpdatedReplicas int32  `json:"updated_replicas"`
	AvailableReplicas int32 `json:"available_replicas"`
	Age            string `json:"age"`
	Image          string `json:"image"`
}

type ServiceInfo struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Type      string `json:"type"`
	ClusterIP string `json:"cluster_ip"`
	Ports     []string `json:"ports"`
	Age       string `json:"age"`
}

type NamespaceInfo struct {
	Name string `json:"name"`
	Age  string `json:"age"`
	Status string `json:"status"`
}

func NewKubernetesService() (*KubernetesService, error) {
	var config *rest.Config
	var err error

	//try in-cluster config first
	config, err = rest.InClusterConfig()
	if err != nil {
		//fallback to kubeconfig file
		kubeconfig := filepath.Join(os.Getenv("HOME"), ".kube", "config")
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return nil, fmt.Errorf("failed to load kubeconfig: %v",err)
	}
}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create kubernetes clientset: %v", err)
	}

	return &KubernetesService{clientset: clientset}, nil
}

func (s *KubernetesService) GetPods(namespace string) ([]PodInfo, error) {
	ctx := context.Background()
	
	var pods *corev1.PodList
	var err error
	
	if namespace == "" || namespace == "all" {
		pods, err = s.clientset.CoreV1().Pods("").List(ctx, metav1.ListOptions{})
	} else {
		pods, err = s.clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{})
	}
	
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %v", err)
	}


	var podInfos []PodInfo
	for _, pod := range pods.Items {
		restarts := int32(0)
		if len(pod.Status.ContainerStatuses) > 0 {
			restarts = pod.Status.ContainerStatuses[0].RestartCount
		}

		image := ""
		if len(pod.Spec.Containers) > 0 {
			image = pod.Spec.Containers[0].Image
		}

		cpuRequest := "N/A"
		memRequest := "N/A"
		if len(pod.Spec.Containers) > 0 && pod.Spec.Containers[0].Resources.Requests != nil {
			if cpu, ok := pod.Spec.Containers[0].Resources.Requests["cpu"]; ok {
				cpuRequest = cpu.String()
			}
			if mem, ok := pod.Spec.Containers[0].Resources.Requests["memory"]; ok {
				memRequest = mem.String()
			}
		}

		podInfos = append(podInfos, PodInfo{
			Name:       pod.Name,
			Namespace:  pod.Namespace,
			Status:     string(pod.Status.Phase),
			Restarts:   restarts,
			Age:        pod.CreationTimestamp.String(),
			Node:       pod.Spec.NodeName,
			IP:         pod.Status.PodIP,
			Image:      image,
			CPURequest: cpuRequest,
			MemRequest: memRequest,
		})
	}

	return podInfos, nil
}

// GetDeployments retrieves all deployments
func (s *KubernetesService) GetDeployments(namespace string) ([]DeploymentInfo, error) {
	ctx := context.Background()
	
	var deployments []DeploymentInfo
	
	if namespace == "" || namespace == "all" {
		namespace = ""
	}
	
	deployList, err := s.clientset.AppsV1().Deployments(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list deployments: %v", err)
	}

	for _, deploy := range deployList.Items {
		image := ""
		if len(deploy.Spec.Template.Spec.Containers) > 0 {
			image = deploy.Spec.Template.Spec.Containers[0].Image
		}

		deployments = append(deployments, DeploymentInfo{
			Name:              deploy.Name,
			Namespace:         deploy.Namespace,
			Replicas:          *deploy.Spec.Replicas,
			ReadyReplicas:     deploy.Status.ReadyReplicas,
			UpdatedReplicas:   deploy.Status.UpdatedReplicas,
			AvailableReplicas: deploy.Status.AvailableReplicas,
			Age:               deploy.CreationTimestamp.String(),
			Image:             image,
		})
	}

	return deployments, nil
}

// GetServices retrieves all services
func (s *KubernetesService) GetServices(namespace string) ([]ServiceInfo, error) {
	ctx := context.Background()
	
	if namespace == "" || namespace == "all" {
		namespace = ""
	}
	
	serviceList, err := s.clientset.CoreV1().Services(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list services: %v", err)
	}

	var services []ServiceInfo
	for _, svc := range serviceList.Items {
		ports := []string{}
		for _, port := range svc.Spec.Ports {
			ports = append(ports, fmt.Sprintf("%d:%d/%s", port.Port, port.NodePort, port.Protocol))
		}

		services = append(services, ServiceInfo{
			Name:      svc.Name,
			Namespace: svc.Namespace,
			Type:      string(svc.Spec.Type),
			ClusterIP: svc.Spec.ClusterIP,
			Ports:     ports,
			Age:       svc.CreationTimestamp.String(),
		})
	}

	return services, nil
}

// GetNamespaces retrieves all namespaces
func (s *KubernetesService) GetNamespaces() ([]NamespaceInfo, error) {
	ctx := context.Background()
	
	nsList, err := s.clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list namespaces: %v", err)
	}

	var namespaces []NamespaceInfo
	for _, ns := range nsList.Items {
		namespaces = append(namespaces, NamespaceInfo{
			Name:   ns.Name,
			Status: string(ns.Status.Phase),
			Age:    ns.CreationTimestamp.String(),
		})
	}

	return namespaces, nil
}

// GetPodLogs retrieves logs from a specific pod
func (s *KubernetesService) GetPodLogs(namespace, podName string, lines int64) (string, error) {
	ctx := context.Background()
	
	podLogOpts := corev1.PodLogOptions{
		TailLines: &lines,
	}
	
	req := s.clientset.CoreV1().Pods(namespace).GetLogs(podName, &podLogOpts)
	podLogs, err := req.Stream(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get pod logs: %v", err)
	}
	defer podLogs.Close()

	buf := make([]byte, 2000)
	numBytes, err := podLogs.Read(buf)
	if err != nil {
		return "", fmt.Errorf("failed to read pod logs: %v", err)
	}
	
	return string(buf[:numBytes]), nil
}