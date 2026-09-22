// Stock photography used for DEMO PROPERTY DATA only. Images are royalty-free
// stock photos and do not depict real, currently-listed properties.

function px(id: number, ext: "jpeg" | "png" = "jpeg") {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200`;
}

export const SINGLE_FAMILY_IMAGES = [
  px(8469934),
  px(6035315),
  px(8469940),
  px(7546775),
  px(3555615, "png"),
];

export const CONDO_IMAGES = [px(6538930), px(6585624), px(7546548), px(6670661)];

export const TOWNHOUSE_IMAGES = [px(18729447), px(14493179), px(28403269), px(3571200, "png")];

export const APARTMENT_IMAGES = [px(26957678), px(5674684), px(27459248), px(37224965)];

export const LUXURY_IMAGES = [px(8143671), px(8134745), px(6032280), px(8134748)];

export const INTERIOR_IMAGES = [
  px(13009887),
  px(7174391),
  px(6523300),
  px(7061664),
  px(6527065),
  px(6480203),
];

export function imagesForType(propertyType: string, seed: number): string[] {
  let exterior: string[];
  switch (propertyType) {
    case "Condo":
      exterior = CONDO_IMAGES;
      break;
    case "Townhouse":
      exterior = TOWNHOUSE_IMAGES;
      break;
    case "Apartment":
    case "Rental":
      exterior = APARTMENT_IMAGES;
      break;
    case "Luxury Home":
      exterior = LUXURY_IMAGES;
      break;
    default:
      exterior = SINGLE_FAMILY_IMAGES;
  }
  const primary = exterior[seed % exterior.length];
  const secondary = INTERIOR_IMAGES[seed % INTERIOR_IMAGES.length];
  const tertiary = INTERIOR_IMAGES[(seed + 3) % INTERIOR_IMAGES.length];
  return [primary, secondary, tertiary];
}
