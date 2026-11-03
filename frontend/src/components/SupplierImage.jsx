import PrivateImage from './PrivateImage';

const SupplierImage = ({ imagePath, supplierName, className = '' }) => {
  if (!imagePath) {
    return null;
  }

  return (
    <PrivateImage
      className={className}
      imagePath={imagePath}
      alt={`${supplierName} logo`}
    />
  );
};

export default SupplierImage;
