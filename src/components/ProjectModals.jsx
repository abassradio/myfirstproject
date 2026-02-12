import { useState } from "react";
import { crewTemplates } from "@/hooks/useProjectData";

export const ProjectCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [newProject, setNewProject] = useState({
    name: "",
    address: "",
    area: "",
    startDate: "",
    crewIds: [],
  });

  const handleSubmit = async () => {
    if (!newProject.name.trim()) return;
    try {
      await onSubmit(newProject);
      setNewProject({
        name: "",
        address: "",
        area: "",
        startDate: "",
        crewIds: [],
      });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-slate-900">
            إضافة مشروع جديد
          </h3>
          <button
            type="button"
            className="min-h-[40px] rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            onClick={onClose}
            disabled={isLoading}
          >
            إغلاق
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            اسم المشروع
            <input
              type="text"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              placeholder="مثال: بناية الكرادة"
              disabled={isLoading}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            عنوان المشروع
            <input
              type="text"
              value={newProject.address}
              onChange={(e) =>
                setNewProject({ ...newProject, address: e.target.value })
              }
              placeholder="مثال: بغداد - شارع 62"
              disabled={isLoading}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            المساحة الكلية (م2)
            <input
              type="number"
              min="0"
              value={newProject.area}
              onChange={(e) =>
                setNewProject({ ...newProject, area: e.target.value })
              }
              disabled={isLoading}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            تاريخ البدء
            <input
              type="date"
              value={newProject.startDate}
              onChange={(e) =>
                setNewProject({ ...newProject, startDate: e.target.value })
              }
              disabled={isLoading}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
            />
          </label>
        </div>
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-700">
            إدارة الكوادر الأولية
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {crewTemplates.map((crew) => (
              <label
                key={crew.id}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  newProject.crewIds.includes(crew.id)
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={newProject.crewIds.includes(crew.id)}
                  onChange={() => {
                    const hasCrew = newProject.crewIds.includes(crew.id);
                    const updatedCrewIds = hasCrew
                      ? newProject.crewIds.filter((id) => id !== crew.id)
                      : [...newProject.crewIds, crew.id];
                    setNewProject({
                      ...newProject,
                      crewIds: updatedCrewIds,
                    });
                  }}
                  disabled={isLoading}
                  className="h-4 w-4"
                />
                {crew.name}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            إذا لم تختر أي كادر سيتم إضافة جميع الكوادر الافتراضية.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isLoading}
            className="min-h-[44px] rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
            onClick={handleSubmit}
          >
            {isLoading ? "جاري الحفظ..." : "حفظ المشروع"}
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            onClick={onClose}
            disabled={isLoading}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProjectEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  isLoading = false,
}) => {
  const [editProject, setEditProject] = useState({
    name: project?.name || "",
    address: project?.address || "",
    area: project?.area || "",
    startDate: project?.startDate || "",
  });

  const handleSubmit = async () => {
    if (!editProject.name.trim()) return;
    try {
      await onSubmit(editProject);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-slate-900">
            تعديل بيانات المشروع
          </h3>
          <button
            type="button"
            className="min-h-[40px] rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            onClick={onClose}
            disabled={isLoading}
          >
            إغلاق
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          عدل البيانات الأساسية للمشروع بسهولة وباللغة العربية.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            اسم المشروع
            <input
              type="text"
              value={editProject.name}
              onChange={(e) =>
                setEditProject({ ...editProject, name: e.target.value })
              }
              placeholder="مثال: مجمع الورد"
              disabled={isLoading}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            عنوان المشروع
            <input
              type="text"
              value={editProject.address}
              onChange={(e) =>
                setEditProject({ ...editProject, address: e.target.value })
              }
              placeholder="مثال: بغداد - اليرموك"
              disabled={isLoading}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            المساحة الكلية (م2)
            <input
              type="number"
              min="0"
              value={editProject.area}
              onChange={(e) =>
                setEditProject({ ...editProject, area: e.target.value })
              }
              disabled={isLoading}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            تاريخ البدء
            <input
              type="date"
              value={editProject.startDate}
              onChange={(e) =>
                setEditProject({ ...editProject, startDate: e.target.value })
              }
              disabled={isLoading}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none disabled:opacity-50"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isLoading}
            className="min-h-[44px] rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
            onClick={handleSubmit}
          >
            {isLoading ? "جاري التحديث..." : "حفظ التعديلات"}
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            onClick={onClose}
            disabled={isLoading}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
