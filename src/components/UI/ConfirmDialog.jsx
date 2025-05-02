// src/components/ConfirmDialog.jsx
import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, body, cancelText = 'Cancelar', confirmText = 'Eliminar' }) => {
  const cancelRef = React.useRef();

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      motionPreset="scale"
      isCentered
    >
      <AlertDialogOverlay />
      <AlertDialogContent borderRadius="2xl" p={4}>
        <AlertDialogHeader fontSize="xl" fontWeight="bold">
          {title}
        </AlertDialogHeader>

        <AlertDialogBody fontSize="md" color="gray.600">
          {body}
        </AlertDialogBody>

        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose} mr={3} variant="outline">
            {cancelText}
          </Button>
          <Button colorScheme="red" onClick={onConfirm}>
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;