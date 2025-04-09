import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { aesEncrypt, aesDecrypt, validatePhone } from '../../utils/encryption';

/**
 * EncryptionForm component for encrypting/decrypting CSV files
 * @param {Object} props - Component props
 * @returns {JSX.Element} - EncryptionForm component
 */
const EncryptionForm = ({ mode }) => {
  // Form state
  const [key, setKey] = useState("-VWdb-9Ha^NSGbb4");
  const [iv, setIV] = useState("?L$%!G-ADpj>ykP8");
  const [columnName, setColumnName] = useState('phone');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      previewFile(selectedFile);
    }
  };

  // Preview file contents
  const previewFile = (file) => {
    Papa.parse(file, {
      header: true,
      preview: 5,
      complete: (result) => {
        setPreview(result);
        
        // Check if the selected column exists
        if (result.meta.fields && !result.meta.fields.includes(columnName)) {
          setError(`Warning: Column "${columnName}" not found in the file. Available columns: ${result.meta.fields.join(', ')}`);
        } else {
          setError('');
        }
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
        setPreview(null);
      }
    });
  };

  // Process file for encryption/decryption
  const processFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError('');
    setResults(null);

    Papa.parse(file, {
      header: true,
      complete: async (result) => {
        // Check if column exists
        if (!result.meta.fields.includes(columnName)) {
          setError(`Column "${columnName}" not found. Available columns: ${result.meta.fields.join(', ')}`);
          setProcessing(false);
          return;
        }

        try {
          const processedData = [];
          let successCount = 0;
          let errorCount = 0;
          
          // Process each row sequentially to handle the async encryption/decryption
          for (let i = 0; i < result.data.length; i++) {
            const row = result.data[i];
            const newRow = { ...row };
            const value = row[columnName];
            
            try {
              if (mode === 'encrypt') {
                // Validate phone number for encryption
                if (!validatePhone(value)) {
                  throw new Error(`Invalid phone number format`);
                }
                
                // Encrypt the phone number
                newRow[`${columnName}_encrypted`] = await aesEncrypt(value, key, iv);
                newRow.status = 'success';
                successCount++;
              } else {
                // Decrypt the encrypted value
                newRow[`${columnName}_decrypted`] = await aesDecrypt(value, key, iv);
                newRow.status = 'success';
                successCount++;
              }
            } catch (err) {
              newRow.status = 'error';
              newRow.error = err.message;
              errorCount++;
            }
            
            processedData.push(newRow);
          }
          
          // Update the results state with the processed data
          setResults({
            data: processedData,
            stats: {
              total: processedData.length,
              success: successCount,
              error: errorCount,
              successRate: processedData.length ? (successCount / processedData.length * 100).toFixed(2) : 0
            }
          });
          
        } catch (err) {
          setError(`Error processing file: ${err.message}`);
        } finally {
          setProcessing(false);
        }
      },
      error: (err) => {
        setError(`Error processing file: ${err.message}`);
        setProcessing(false);
      }
    });
  };

  // Download results
  const downloadResults = () => {
    if (!results) return;
    
    const csv = Papa.unparse(results.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${mode === 'encrypt' ? 'encrypted' : 'decrypted'}_${fileName}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset form
  const resetForm = () => {
    setFile(null);
    setFileName('');
    setResults(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {mode === 'encrypt' ? 'Encrypt Phone Numbers' : 'Decrypt Phone Numbers'}
      </h2>
      
      {/* File Selection */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">CSV File</label>
        <div className="flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Select File
          </label>
          <span className="ml-3 text-gray-600">
            {fileName || 'No file selected'}
          </span>
        </div>
      </div>

      {/* Column Name */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="column-name">
          Column Name
        </label>
        <input
          id="column-name"
          type="text"
          value={columnName}
          onChange={(e) => setColumnName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Name of column containing phone numbers"
        />
      </div>

      {/* Advanced Options */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <input
            id="advanced-toggle"
            type="checkbox"
            checked={showAdvanced}
            onChange={() => setShowAdvanced(!showAdvanced)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <label htmlFor="advanced-toggle" className="ml-2 text-gray-700 font-semibold">
            Show Advanced Options
          </label>
        </div>
        
        {showAdvanced && (
          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="key">
                Encryption Key
              </label>
              <input
                id="key"
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="iv">
                Initialization Vector (IV)
              </label>
              <input
                id="iv"
                type="text"
                value={iv}
                onChange={(e) => setIV(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* File Preview */}
      {preview && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">File Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  {preview.meta.fields.map((field) => (
                    <th key={field} className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.data.slice(0, 3).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {preview.meta.fields.map((field) => (
                      <td key={field} className="py-2 px-4 border-b text-sm">
                        {row[field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={processFile}
          disabled={!file || processing}
          className={`py-2 px-4 rounded font-medium ${
            !file || processing 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {processing ? 'Processing...' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>
        
        <button
          onClick={resetForm}
          className="py-2 px-4 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300"
        >
          Reset
        </button>
        
        {results && (
          <button
            onClick={downloadResults}
            className="py-2 px-4 bg-green-500 text-white rounded font-medium hover:bg-green-600"
          >
            Download Results
          </button>
        )}
      </div>

      {/* Results */}
      {results && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Processing Results</h3>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded border border-blue-100">
              <div className="text-sm text-blue-500 font-medium">Total Records</div>
              <div className="text-2xl font-bold text-blue-600">{results.stats.total}</div>
            </div>
            <div className="bg-green-50 p-3 rounded border border-green-100">
              <div className="text-sm text-green-500 font-medium">Successful</div>
              <div className="text-2xl font-bold text-green-600">{results.stats.success}</div>
            </div>
            <div className="bg-red-50 p-3 rounded border border-red-100">
              <div className="text-sm text-red-500 font-medium">Errors</div>
              <div className="text-2xl font-bold text-red-600">{results.stats.error}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
              <div className="text-sm text-yellow-600 font-medium">Success Rate</div>
              <div className="text-2xl font-bold text-yellow-600">{results.stats.successRate}%</div>
            </div>
          </div>
          
          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {columnName}
                  </th>
                  <th className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {mode === 'encrypt' ? `${columnName}_encrypted` : `${columnName}_decrypted`}
                  </th>
                  <th className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.data.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className={row.status === 'error' ? 'bg-red-50' : ''}>
                    <td className="py-2 px-4 border-b text-sm">{idx + 1}</td>
                    <td className="py-2 px-4 border-b text-sm">{row[columnName]}</td>
                    <td className="py-2 px-4 border-b text-sm">
                      {mode === 'encrypt' 
                        ? row[`${columnName}_encrypted`] 
                        : row[`${columnName}_decrypted`]}
                    </td>
                    <td className="py-2 px-4 border-b text-sm">
                      {row.status === 'success' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Success
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800" title={row.error}>
                          Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.data.length > 10 && (
              <div className="mt-2 text-sm text-gray-500">
                Showing 10 of {results.data.length} rows. Download the results to see all data.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EncryptionForm;
