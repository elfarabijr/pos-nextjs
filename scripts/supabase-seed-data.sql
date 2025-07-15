-- Insert sample categories
INSERT INTO categories (name, description, color, icon, sort_order) VALUES
('Electronics', 'Electronic devices and accessories', '#3B82F6', 'smartphone', 1),
('Clothing', 'Apparel and fashion items', '#10B981', 'shirt', 2),
('Footwear', 'Shoes and sandals', '#F59E0B', 'footprints', 3),
('Books', 'Books and educational materials', '#8B5CF6', 'book', 4),
('Home & Garden', 'Home improvement and garden supplies', '#EF4444', 'home', 5);

-- Insert sample products with barcodes
INSERT INTO products (name, description, price, category, stock, barcode, image) VALUES
('iPhone 15 Pro', 'Latest Apple smartphone with advanced features', 999.99, 'Electronics', 15, '123456789012', '/placeholder.svg?height=200&width=200'),
('Samsung Galaxy S24', 'Premium Android smartphone', 899.99, 'Electronics', 12, '123456789013', '/placeholder.svg?height=200&width=200'),
('MacBook Pro', 'Professional laptop for creative work', 1999.99, 'Electronics', 8, '123456789014', '/placeholder.svg?height=200&width=200'),
('AirPods Pro', 'Wireless earbuds with noise cancellation', 249.99, 'Electronics', 30, '123456789015', '/placeholder.svg?height=200&width=200'),
('iPad Air', 'Versatile tablet for work and entertainment', 599.99, 'Electronics', 20, '123456789016', '/placeholder.svg?height=200&width=200'),

('Nike Air Max', 'Comfortable running shoes', 129.99, 'Footwear', 25, '234567890123', '/placeholder.svg?height=200&width=200'),
('Adidas Ultraboost', 'High-performance athletic shoes', 149.99, 'Footwear', 18, '234567890124', '/placeholder.svg?height=200&width=200'),
('Converse Chuck Taylor', 'Classic canvas sneakers', 59.99, 'Footwear', 35, '234567890125', '/placeholder.svg?height=200&width=200'),

('Levi\'s Jeans', 'Classic denim jeans', 79.99, 'Clothing', 40, '345678901234', '/placeholder.svg?height=200&width=200'),
('Adidas Hoodie', 'Comfortable cotton hoodie', 79.99, 'Clothing', 18, '345678901235', '/placeholder.svg?height=200&width=200'),
('Nike T-Shirt', 'Athletic performance t-shirt', 29.99, 'Clothing', 50, '345678901236', '/placeholder.svg?height=200&width=200'),

('The Great Gatsby', 'Classic American literature', 12.99, 'Books', 100, '456789012345', '/placeholder.svg?height=200&width=200'),
('To Kill a Mockingbird', 'Timeless novel about justice and morality', 13.99, 'Books', 85, '456789012346', '/placeholder.svg?height=200&width=200'),

('Garden Hose', 'Flexible watering hose for gardens', 39.99, 'Home & Garden', 15, '567890123456', '/placeholder.svg?height=200&width=200'),
('Plant Fertilizer', 'Organic fertilizer for healthy plants', 19.99, 'Home & Garden', 60, '567890123457', '/placeholder.svg?height=200&width=200');

-- Update category product counts
UPDATE categories SET product_count = (
  SELECT COUNT(*) FROM products WHERE products.category = categories.name
);
