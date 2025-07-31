// src/pages/Crops.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getCrops, addCrop, deleteCrop } from '../api/crops';
import CropSelector from '../components/CropSelector';
import { detectCropDisease } from '../api/ai';

export default function Crops() {
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({ name: '', plantedOn: '', area: '', notes: '' });
  const [uploading, setUploading] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = () => {
    getCrops()
      .then(r => setCrops(r.data))
      .catch(console.error);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onAdd = e => {
    e.preventDefault();
    addCrop({
      name: form.name,
      plantedOn: new Date(form.plantedOn),
      area: form.area ? Number(form.area) : undefined,
      notes: form.notes
    })
      .then(fetchCrops)
      .finally(() => setForm({ name: '', plantedOn: '', area: '', notes: '' }));
  };

  const onDelete = id => {
    deleteCrop(id).then(fetchCrops);
  };

  const onFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setDiseaseResult(null);

    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await detectCropDisease(fd);
      const arr = res.data.result;
      if (Array.isArray(arr) && arr.length > 0) {
        // pick highest-score prediction
        const [best] = arr.sort((a, b) => b.score - a.score);
        setDiseaseResult({
          label: best.label.replace(/___/g, ' '),
          score: best.score
        });
      } else {
        setDiseaseResult({ error: 'No predictions returned.' });
      }
    } catch (err) {
      console.error(err);
      setDiseaseResult({ error: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* ─── Crop Form ───────────────────────────────────────────── */}
      <section className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Add / Manage Crops</h2>
        <form onSubmit={onAdd} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Select Crop</label>
            <CropSelector
              selected={form.name}
              onSelect={val => setForm(f => ({ ...f, name: val }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">Planted On</label>
              <input
                type="date"
                name="plantedOn"
                value={form.plantedOn}
                onChange={handleChange}
                required
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Area (acres)</label>
              <input
                type="number"
                name="area"
                value={form.area}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Notes</label>
              <input
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Crop
          </button>
        </form>

        <ul className="mt-6 space-y-3">
          {crops.length ? (
            crops.map(c => (
              <li
                key={c._id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded"
              >
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(c.plantedOn).toLocaleDateString()}
                    {c.area && ` • ${c.area} acres`}
                    {c.notes && ` • ${c.notes}`}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(c._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No crops added yet.</p>
          )}
        </ul>
      </section>

      {/* ─── Disease Detection ────────────────────────────────────── */}
      <section className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Detect Crop Disease</h2>
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className={`bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {uploading ? 'Analyzing…' : 'Choose Image & Analyze'}
          </button>
        </div>

        {uploading && <p>Loading… please wait.</p>}

        {diseaseResult?.error && (
          <p className="text-red-600">{diseaseResult.error}</p>
        )}

        {diseaseResult?.label && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Disease Predicted</h3>
            <p>
              <strong>Your Crop have {diseaseResult.label}</strong>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
