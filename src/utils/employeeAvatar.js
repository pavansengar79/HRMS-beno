// ** Employee Avatar Utility
// Centralized helper for consistent avatar display across all components
// Avoids code duplication and handles multiple field name variations

/**
 * Get avatar URL from employee/user object
 * Handles multiple field name variations: profilePhoto, profilePicture, avatar, photo
 * 
 * @param {Object} entity - Employee or User object
 * @returns {string|null} - Avatar URL or null
 */
export const getAvatarUrl = (entity) => {
  if (!entity) return null;
  
  // Check all possible field names in order of preference
  // Standard field: profilePhoto
  return entity.profilePhoto || 
         entity.profilePicture || 
         entity.avatar || 
         entity.photo || 
         entity.avatarUrl || 
         entity.employee?.profilePhoto ||
         entity.employee?.profilePicture ||
         entity.employee?.avatar ||
         null;
};

/**
 * Get initials from name (max 2 characters)
 * Used as fallback when no avatar image available
 * 
 * @param {Object|string} entity - Employee object or name string
 * @returns {string} - Initials (max 2 chars, uppercase)
 */
export const getInitials = (entity) => {
  if (!entity) return '?';
  
  // If string, use it directly
  const name = typeof entity === 'string' ? entity : (entity.name || entity.firstName || '');
  
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * EmployeeAvatar Component Props Builder
 * Returns props for MUI Avatar component with proper src and fallback
 * 
 * @param {Object} entity - Employee or User object
 * @param {Object} options - Additional options
 * @param {string} options.alt - Alt text (defaults to entity.name)
 * @param {number} options.size - Avatar size in pixels
 * @returns {Object} - Props object for Avatar component
 */
export const getAvatarProps = (entity, options = {}) => {
  const avatarUrl = getAvatarUrl(entity);
  const name = entity?.name || entity?.firstName || '';
  const initials = getInitials(name);
  
  return {
    src: avatarUrl,
    alt: options.alt || name || 'User',
    children: avatarUrl ? undefined : initials,
    sx: {
      width: options.size || 40,
      height: options.size || 40,
      backgroundColor: 'primary.main',
      fontSize: '0.875rem',
      fontWeight: 600,
      ...options.sx
    }
  };
};

/**
 * Format employee data with avatar fields
 * Ensures consistent avatar fields across all employee data
 * 
 * @param {Object} employee - Employee object
 * @returns {Object} - Employee with avatarUrl and initials
 */
export const formatEmployeeAvatar = (employee) => {
  if (!employee) return null;
  
  // Handle nested employee object
  const emp = employee.employee || employee;
  
  return {
    ...employee,
    avatarUrl: getAvatarUrl(emp),
    initials: getInitials(emp.name)
  };
};

/**
 * Format multiple employees with avatar data
 * Used in table/list views
 * 
 * @param {Array} employees - Array of employee objects
 * @returns {Array} - Array of formatted employee objects
 */
export const formatEmployeesAvatar = (employees) => {
  if (!Array.isArray(employees)) return [];
  return employees.map(formatEmployeeAvatar);
};
