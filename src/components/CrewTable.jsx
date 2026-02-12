import { formatIQD, measurementOptions } from "@/utils/formatting";

function CrewTable({
  rows,
  crewName,
  totalAmount,
  paidAmount,
  remainingAmount,
  isPaidInFull,
  onAddRow,
  onRowChange,
  onToggleEdit,
  onDeleteRow,
  onPaidChange,
  onPrint,
  isLoading = false,
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-slate-900">
          جدول الذرعة - {crewName}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">
            يتم احتساب المجموع تلقائيا
          </span>
          <button
            type="button"
            disabled={isLoading}
            className="min-h-[44px] rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
            onClick={onAddRow}
          >
            إضافة سطر جديد
          </button>
          <button
            type="button"
            disabled={isLoading || rows.length === 0}
            className="min-h-[44px] rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:opacity-50"
            onClick={onPrint}
          >
            تصدير كـ PDF / طباعة
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
        <table className="w-full text-right text-sm text-slate-700">
          <thead className="bg-slate-900 text-xs uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-3">ت</th>
              <th className="px-4 py-3">التاريخ</th>
              <th className="px-4 py-3">اسم المادة / العمل</th>
              <th className="px-4 py-3">نوع القياس</th>
              <th className="px-4 py-3">سعر الوحدة</th>
              <th className="px-4 py-3">العدد / الكمية</th>
              <th className="px-4 py-3">المجموع</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => {
              const rowTotal =
                Number(item.quantity || 0) * Number(item.price || 0);

              return (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    {item.isEditing ? (
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          onRowChange(item.id, "date", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
                      />
                    ) : (
                      <span>{item.date || "-"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.isEditing ? (
                      <input
                        type="text"
                        value={item.material}
                        onChange={(e) =>
                          onRowChange(item.id, "material", e.target.value)
                        }
                        placeholder="مثال: صبغ حائط"
                        disabled={isLoading}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
                      />
                    ) : (
                      <span className="font-semibold text-slate-900">
                        {item.material || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.isEditing ? (
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          onRowChange(item.id, "unit", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
                      >
                        {measurementOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{item.unit}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          onRowChange(item.id, "price", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
                      />
                    ) : (
                      <span>{formatIQD(item.price || 0)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          onRowChange(item.id, "quantity", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
                      />
                    ) : (
                      <span>{item.quantity || "-"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {formatIQD(rowTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        className="min-h-[40px] rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:opacity-50"
                        onClick={() => onToggleEdit(item.id)}
                      >
                        {item.isEditing ? "حفظ" : "تعديل"}
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        className="min-h-[40px] rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700 disabled:opacity-50"
                        onClick={() => onDeleteRow(item.id)}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td className="px-4 py-3 text-sm text-slate-600" colSpan={6}>
                المجموع الكلي للحساب
              </td>
              <td className="px-4 py-3 text-base font-semibold text-slate-900">
                {formatIQD(totalAmount)}
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            المجموع الكلي للذرعة
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatIQD(totalAmount)}
          </p>
        </div>
        <div
          className={`rounded-2xl border p-4 shadow-sm transition ${
            isPaidInFull
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-700"
              : "border-slate-200 bg-white/80 text-slate-700"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider">
            المبلغ الواصل / السلف
          </p>
          <input
            type="number"
            min="0"
            value={paidAmount}
            onChange={(e) => onPaidChange(e.target.value)}
            disabled={isLoading}
            className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none disabled:opacity-50 ${
              isPaidInFull
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400"
                : "border-slate-200 bg-white text-slate-700 focus:border-slate-900"
            }`}
          />
        </div>
        <div
          className={`rounded-2xl border p-4 shadow-sm ${
            remainingAmount <= 0
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-700"
              : "border-amber-200 bg-amber-50/80 text-amber-700"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider">
            المبلغ المتبقي بذمة الشركة
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatIQD(remainingAmount)}
          </p>
        </div>
      </div>
    </section>
  );
}

export default CrewTable;
