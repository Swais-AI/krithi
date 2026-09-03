// Keep the existing file but make sure the class dropdown uses cls.class_id as value
// Find the class dropdown and ensure it looks like this:

<select
  name="class_id"
  value={formData.class_id}
  onChange={handleChange}
  className={`w-full px-3 py-2 mt-1 border rounded-md ${errors.class_id ? 'border-red-500' : 'border-gray-300'}`}
>
  <option value="">Select Class</option>
  {availableClasses.map((cls) => (
    <option key={cls.class_id} value={cls.class_id}>
      {cls.class_name || `Class ${cls.class_id}`}
    </option>
  ))}
</select>
