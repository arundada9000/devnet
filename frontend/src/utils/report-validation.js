const REPORT_TYPES = [
  'fire', 'police', 'flood', 'accident', 'landslide', 'earthquake', 'other'
]

const MIN_DESC_LENGTH = 10
const MAX_DESC_LENGTH = 500
const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function validateReport({ type, description, location, photo }) {
  const errors = {}

  if (!type) {
    errors.type = 'Select an emergency type'
  } else if (!REPORT_TYPES.includes(type)) {
    errors.type = 'Invalid emergency type'
  }

  if (!description) {
    errors.description = 'Description is required'
  } else if (description.length < MIN_DESC_LENGTH) {
    errors.description = `Description must be at least ${MIN_DESC_LENGTH} characters`
  } else if (description.length > MAX_DESC_LENGTH) {
    errors.description = `Description must be under ${MAX_DESC_LENGTH} characters`
  }

  if (!location || !location.lat || !location.lng) {
    errors.location = 'GPS location is required'
  } else if (location.lat < -90 || location.lat > 90) {
    errors.location = 'Invalid latitude'
  } else if (location.lng < -180 || location.lng > 180) {
    errors.location = 'Invalid longitude'
  }

  if (photo) {
    if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
      errors.photo = 'Photo must be JPEG, PNG, GIF, or WebP'
    } else if (photo.size > MAX_PHOTO_SIZE) {
      errors.photo = 'Photo must be under 5MB'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
