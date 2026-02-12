import { useState } from "react";
import { useCrews } from "@/hooks/useCrews";

export default function CrewGateway({ onClose }) {
  const { crews, loading, error, createCrew, deleteCrew } = useCrews();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("متر");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createCrew({ name: name.trim(), default_unit: unit });
      setName("");
    } catch (e) {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">بوابة الكوادر</h3>
        {onClose && (
          <button onClick={onClose} className="text-sm text-slate-500">
            إغلاق
          </button>
        )}
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم الكادر (مثلاً: صباغ)"
            className="flex-1 rounded border px-3 py-2"
          />
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="وحدة القياس"
            className="w-32 rounded border px-3 py-2"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="rounded bg-slate-900 px-4 py-2 text-white"
          >
            إضافة
          </button>
        </div>
        {loading && <p className="text-sm text-slate-500">جاري التحميل...</p>}
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <ul className="mt-2 space-y-2">
          {crews.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded border px-3 py-2"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-slate-500">
                  وحدة: {c.default_unit || "-"}
                </div>
              </div>
              <div>
                <button
                  onClick={() => deleteCrew(c.id)}
                  className="text-sm text-rose-600"
                >
                  حذف
                </button>
              </div>
            </li>
          ))}
          {!loading && crews.length === 0 && (
            <li className="text-sm text-slate-500">لا توجد كوادر حالياً.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
