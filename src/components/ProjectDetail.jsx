import { useState, useMemo } from "react";
import CrewTable from "./CrewTable";
import { formatIQD } from "@/utils/formatting";

function ProjectDetail({
  project,
  projectData,
  onBack,
  onAddCrewToProject,
  onAddRow,
  onRowChange,
  onToggleEdit,
  onDeleteRow,
  onPaidChange,
  isLoading = false,
  displayName = "مستخدم",
}) {
  const [activeCrewId, setActiveCrewId] = useState(null);
  const [newCrewName, setNewCrewName] = useState("");

  const activeCrew = useMemo(() => {
    if (!project) return null;
    return (
      (project.crews || []).find((crew) => crew.id === activeCrewId) || null
    );
  }, [project, activeCrewId]);

  const activeRows = useMemo(() => {
    if (!project || !activeCrewId) return [];
    return projectData[project.id]?.crewRows?.[activeCrewId] || [];
  }, [project, activeCrewId, projectData]);

  const totalAmount = useMemo(() => {
    if (!activeCrewId) return 0;
    return activeRows.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
      0,
    );
  }, [activeCrewId, activeRows]);

  const paidAmount = useMemo(() => {
    if (!project || !activeCrewId) return 0;
    return Number(
      projectData[project.id]?.crewFinancials?.[activeCrewId]?.paid || 0,
    );
  }, [project, activeCrewId, projectData]);

  const remainingAmount = useMemo(
    () => totalAmount - paidAmount,
    [totalAmount, paidAmount],
  );

  const isPaidInFull = totalAmount > 0 && remainingAmount <= 0;

  const handleAddCrew = () => {
    if (!newCrewName.trim()) return;
    const newCrewId = onAddCrewToProject(newCrewName);
    setNewCrewName("");
    setActiveCrewId(newCrewId);
  };

  const handlePrint = () => {
    if (!activeCrew || !project) return;
    const formattedDate = new Date().toLocaleDateString("ar-IQ");
    const rowsHtml = activeRows
      .map((row, index) => {
        const rowTotal = Number(row.quantity || 0) * Number(row.price || 0);
        const formattedRowTotal = formatIQD(rowTotal);
        const formattedPrice = formatIQD(row.price || 0);
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${row.date || ""}</td>
            <td>${row.material || "-"}</td>
            <td>${row.unit || "-"}</td>
            <td>${formattedPrice}</td>
            <td>${row.quantity || 0}</td>
            <td>${formattedRowTotal}</td>
          </tr>
        `;
      })
      .join("");

    const printableHtml = `
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>تقरير الكادر</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
            h1, h2, h3 { margin: 0 0 8px; }
              <div>المصدّر: ${displayName || "مستخدم"}</div>
            .meta { margin-bottom: 16px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 13px; text-align: right; }
            th { background: #0f172a; color: #fff; }
            tfoot td { font-weight: 700; background: #f8fafc; }
            .totals { margin-top: 16px; display: flex; gap: 16px; flex-wrap: wrap; }
            .total-card { border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 10px; min-width: 180px; }
          </style>
        </head>
        <body>
          <h1>تقرير حسابات الكادر</h1>
          <div class="meta">
            <div>المشروع: ${project.name}</div>
            <div>الكادر: ${activeCrew.name}</div>
            <div>المصدّر: ${displayName || "مستخدم"}</div>
            <div>تاريخ التصدير: ${formattedDate}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ت</th>
                <th>التاريخ</th>
                <th>اسم المادة / العمل</th>
                <th>نوع القياس</th>
                <th>سعر الوحدة</th>
                <th>العدد / الكمية</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div class="total-card">المجموع الكلي للذرعة: ${formatIQD(totalAmount)}</div>
            <div class="total-card">المبلغ الواصل/السلف: ${formatIQD(paidAmount)}</div>
            <div class="total-card">المبلغ المتبقي بذمة الشركة: ${formatIQD(remainingAmount)}</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            تفاصيل المشروع
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            {project?.name}
          </h2>
          <p className="text-sm text-slate-600">
            العنوان:{" "}
            <span className="font-semibold">{project?.address || "-"}</span>
          </p>
          <p className="text-sm text-slate-600">
            المساحة:{" "}
            <span className="font-semibold">
              {project?.area
                ? Number(project.area).toLocaleString("en-US")
                : "-"}{" "}
              م2
            </span>
          </p>
          <p className="text-sm text-slate-600">
            تاريخ البدء:{" "}
            <span className="font-semibold">{project?.startDate || "-"}</span>
          </p>
          <p className="text-sm text-slate-600">
            الحالة: <span className="font-semibold">{project?.status}</span>
          </p>
        </div>
        <button
          type="button"
          disabled={isLoading}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:opacity-50"
          onClick={onBack}
        >
          عودة
        </button>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">قائمة الكوادر</h3>
        <div className="flex flex-wrap gap-3">
          {(project?.crews || []).map((crew) => (
            <button
              key={crew.id}
              type="button"
              disabled={isLoading}
              className={`min-h-[44px] rounded-full border px-5 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                activeCrewId === crew.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
              }`}
              onClick={() => setActiveCrewId(crew.id)}
            >
              {crew.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newCrewName}
            onChange={(e) => setNewCrewName(e.target.value)}
            disabled={isLoading}
            placeholder="إضافة كادر جديد (مثال: نجار)"
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            disabled={isLoading || !newCrewName.trim()}
            className="min-h-[44px] rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
            onClick={handleAddCrew}
          >
            إضافة كادر جديد
          </button>
        </div>
      </section>

      {activeCrew ? (
        <CrewTable
          rows={activeRows}
          projectName={project?.name}
          crewName={activeCrew.name}
          totalAmount={totalAmount}
          paidAmount={paidAmount}
          remainingAmount={remainingAmount}
          isPaidInFull={isPaidInFull}
          onAddRow={() => onAddRow(project.id, activeCrewId)}
          onRowChange={(rowId, field, value) =>
            onRowChange(project.id, activeCrewId, rowId, field, value)
          }
          onToggleEdit={(rowId) =>
            onToggleEdit(project.id, activeCrewId, rowId)
          }
          onDeleteRow={(rowId) => onDeleteRow(project.id, activeCrewId, rowId)}
          onPaidChange={(value) =>
            onPaidChange(project.id, activeCrewId, value)
          }
          onPrint={handlePrint}
          isLoading={isLoading}
        />
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-600">
          اختر كادر من القائمة لعرض جدول الذرعة والحسابات.
        </section>
      )}
    </>
  );
}

export default ProjectDetail;
