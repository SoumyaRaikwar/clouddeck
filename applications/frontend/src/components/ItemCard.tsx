import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Item } from '../types/item';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {item.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {item.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {item.id}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(item)}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(item.id)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default ItemCard;
