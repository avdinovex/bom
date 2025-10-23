import React from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const DataTable = ({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  actions,
  loading,
  emptyMessage = "No data available"
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || column.accessor || index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title || column.header}
                </th>
              ))}
              {(actions || onView || onEdit || onDelete) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item._id || item.id || index} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td key={`${item._id || index}-${column.key || column.accessor || colIndex}`} className="px-6 py-4 whitespace-nowrap text-sm">
                    {column.render ? (
                      typeof column.render === 'function' ? column.render(item) : column.render
                    ) : (
                      <span className={column.className || "text-gray-900"}>
                        {String(item[column.key] || item[column.accessor] || '-')}
                      </span>
                    )}
                  </td>
                ))}
                {(actions || onView || onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {actions ? (
                        actions.map((action, actionIndex) => {
                          // Check if action should be shown for this item
                          if (action.condition && typeof action.condition === 'function' && !action.condition(item)) {
                            return null;
                          }
                          
                          const IconComponent = action.icon;
                          return (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={action.className || "text-gray-600 hover:text-gray-900 p-1 rounded transition-colors"}
                              title={action.label}
                            >
                              <IconComponent className="h-4 w-4" />
                            </button>
                          );
                        })
                      ) : (
                        <>
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                              title="View"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;