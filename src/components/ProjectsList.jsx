function ProjectsList({
  projects,
  onSelectProject,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteProject,
}) {
  return (
    <>
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          مشاريع الشركة الهندسية
        </p>
        <h2 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
          قائمة المشاريع الحالية
        </h2>
        <button
          type="button"
          className="min-h-[44px] rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
          onClick={onOpenCreateModal}
        >
          إضافة مشروع جديد
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {project.name}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                العنوان:{" "}
                <span className="font-semibold">{project.address || "-"}</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                المساحة:{" "}
                <span className="font-semibold">
                  {project.area
                    ? Number(project.area).toLocaleString("en-US")
                    : "-"}{" "}
                  م2
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                الحالة: <span className="font-semibold">{project.status}</span>
              </p>
            </div>
            <button
              type="button"
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => onSelectProject(project)}
            >
              عرض الكوادر والحسابات
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
                onClick={() => onOpenEditModal(project)}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                تعديل
              </button>
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-red-50 px-4 py-1 text-xs font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100"
                onClick={() => onDeleteProject(project.id)}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M6 6l1 14h10l1-14" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
                حذف
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export default ProjectsList;
