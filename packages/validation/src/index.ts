import { z } from 'zod';
import { isValidGtin } from '@prixpei/domain';

export const barcodeSchema = z.string().transform((value) => value.replace(/\D/g, '')).refine(isValidGtin, 'Code-barres EAN/GTIN invalide');

export const priceReportSchema = z.object({
  productId: z.string().uuid(),
  storeId: z.string().uuid(),
  price: z.number().positive('Le prix doit être supérieur à zéro').max(10_000, 'Prix invraisemblable'),
  priceType: z.enum(['regular', 'promotion']),
  loyaltyOnly: z.boolean(),
  availability: z.enum(['available', 'low_stock', 'unavailable']),
  observedAt: z.iso.datetime().refine((value) => new Date(value) <= new Date(), 'La date ne peut pas être future'),
  conditions: z.string().trim().max(160).optional(),
  comment: z.string().trim().max(280).optional(),
});

export type PriceReportInput = z.infer<typeof priceReportSchema>;

export const commentSchema = z.object({ text: z.string().trim().min(2).max(280) });

export const storeSuggestionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(180),
  category: z.enum(['supermarket', 'convenience', 'organic', 'other']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
