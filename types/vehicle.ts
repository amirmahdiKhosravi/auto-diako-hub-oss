export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  color: string;
  mileage: number;
  listed_price: number;
  floor_price: number;
  status: string;
  vin: string;
  condition_notes: string;
  created_at: string;
  image_urls?: string[] | null;
  body_style?: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  vehicle_condition?: string | null;
  trim?: string | null;
  body_class?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  carfax_link?: string | null;
}
