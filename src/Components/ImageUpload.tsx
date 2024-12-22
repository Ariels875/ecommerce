import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onChange: (files: File[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 4) {
      alert('Máximo 4 imágenes permitidas');
      return;
    }

    const oversizedFiles = acceptedFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Cada imagen debe ser menor a 5MB');
      return;
    }

    onChange(acceptedFiles);
  }, [onChange]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 4
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary"
    >
      <input {...getInputProps()} />
      <p>Arrastra las imágenes aquí o haz clic para seleccionar</p>
      <p className="text-sm text-gray-500">Máximo 4 imágenes, 5MB cada una</p>
    </div>
  );
};

export default ImageUpload;