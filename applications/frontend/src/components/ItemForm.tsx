import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { CreateItemRequest, Item } from '../types/item';

interface ItemFormProps {
  onSubmit: (data: CreateItemRequest) => void;
  onCancel?: () => void;
  initialData?: Item | null;
  isEdit?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({ onSubmit, onCancel, initialData, isEdit = false }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onSubmit({ name: name.trim(), description: description.trim() });
      if (!isEdit) {
        setName('');
        setDescription('');
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Item' : 'Add New Item'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
          inputProps={{ minLength: 3, maxLength: 255 }}
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          required
          multiline
          rows={4}
          inputProps={{ minLength: 10 }}
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={isEdit ? <SaveIcon /> : <AddIcon />}
          >
            {isEdit ? 'Save Changes' : 'Add Item'}
          </Button>
          {isEdit && onCancel && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ItemForm;
