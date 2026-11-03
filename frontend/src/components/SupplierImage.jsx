import { getImageUrl } from '../api/apiConfig';

const SupplierImage = ({ imagePath, supplierName, className = '' }) => {
  if (!imagePath) {
    return null;
  }

  return (
    <img
      className={className}
      src={getImageUrl(imagePath)}
      alt={`${supplierName} logo`}
    />
  );
};

export default SupplierImage;
