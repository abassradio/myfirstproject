import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const storageKey = "vibe-contracting-data";

const crewTemplates = [
  {
    id: "painter",
    name: "صباغ",
    measurements: [
      { material: "صبغ داخلي", quantity: 14, price: 12, unit: "متر" },
      { material: "صبغ خارجي", quantity: 9, price: 18, unit: "متر" },
      { material: "مواد عزل", quantity: 6, price: 22, unit: "قطعة" },
    ],
  },
  {
    id: "electrician",
    name: "كهربائي",
    measurements: [
      { material: "أسلاك نحاسية", quantity: 20, price: 8, unit: "متر طولي" },
      { material: "قواطع كهربائية", quantity: 6, price: 28, unit: "قطعة" },
      { material: "لوحة توزيع", quantity: 2, price: 95, unit: "قطعة" },
    ],
  },
  {
    id: "plasterer",
    name: "لباخ",
    measurements: [
      { material: "لبخ إسمنتي", quantity: 18, price: 10, unit: "متر" },
      { material: "شبك فيبر", quantity: 7, price: 14, unit: "متر" },
      { material: "مضافات لاصقة", quantity: 5, price: 16, unit: "قطعة" },
    ],
  },
];

const crewTemplateMap = crewTemplates.reduce((acc, crew) => {
  acc[crew.id] = crew;
  return acc;
}, {});

const getDefaultProjectCrews = () =>
  crewTemplates.map(({ id, name }) => ({ id, name }));

const defaultProjects = [
  {
    id: "mansour-villa",
    name: "مشروع فيلا المنصور",
    address: "بغداد - المنصور",
    area: 520,
    startDate: "2025-11-12",
    status: "قيد التنفيذ",
    crews: getDefaultProjectCrews(),
  },
  {
    id: "jadriya-building",
    name: "مشروع عمارة الجادرية",
    address: "بغداد - الجادرية",
    area: 980,
    startDate: "2025-12-02",
    status: "قيد التنفيذ",
    crews: getDefaultProjectCrews(),
  },
  {
    id: "university-compound",
    name: "مشروع مجمع حي الجامعة",
    address: "بغداد - حي الجامعة",
    area: 1450,
    startDate: "2026-01-05",
    status: "قيد التنفيذ",
    crews: getDefaultProjectCrews(),
  },
  {
    id: "yarmouk-tower",
    name: "مشروع برج اليرموك",
    address: "بغداد - اليرموك",
    area: 2100,
    startDate: "2025-10-20",
    status: "قيد التنفيذ",
    crews: getDefaultProjectCrews(),
  },
  {
    id: "zahraa-compound",
    name: "مشروع مجمع الزهراء السكني",
    address: "بغداد - الزهراء",
    area: 3250,
    startDate: "2025-09-18",
    status: "قيد التنفيذ",
    crews: getDefaultProjectCrews(),
  },
];

const measurementOptions = ["متر", "متر طولي", "قطعة"];

const getTodayISO = () => new Date().toISOString().slice(0, 10);

const formatIQD = (value) => {
  const amount = Number(value || 0);
  if (Number.isNaN(amount)) return "0";
  return amount.toLocaleString("en-US");
};

const buildRowsFromTemplate = (crewId, useSamples) => {
  const template = crewTemplateMap[crewId];
  if (!useSamples || !template?.measurements?.length) return [];
  const today = getTodayISO();
  return template.measurements.map((item, index) => ({
    id: `${crewId}-${index + 1}`,
    date: today,
    material: item.material,
    unit: item.unit || "متر",
    price: item.price,
    quantity: item.quantity,
    isEditing: false,
  }));
};

// Build per-project rows and financial buckets based on selected crews.
const buildProjectData = (projects, useSamples) =>
  projects.reduce((acc, project) => {
    const crewRows = {};
    const crewFinancials = {};

    (project.crews || []).forEach((crew) => {
      crewRows[crew.id] = buildRowsFromTemplate(crew.id, useSamples);
      crewFinancials[crew.id] = { paid: "" };
    });

    acc[project.id] = { crewRows, crewFinancials };
    return acc;
  }, {});

// Load persisted project data safely from localStorage.
const loadStoredData = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const ensureProjectIds = (projects) =>
  projects.map((project, index) => ({
    ...project,
    id: project.id || `project-${index + 1}`,
  }));

const migrateLegacyData = (stored) => {
  if (!stored?.crews || !stored?.crewRows || !stored?.crewFinancials) {
    return null;
  }

  const legacyCrews = stored.crews.map(({ id, name }) => ({ id, name }));
  const migratedProjects = ensureProjectIds(
    (stored.projects || defaultProjects).map((project) => ({
      ...project,
      address: project.address || "",
      area: project.area || "",
      startDate: project.startDate || "",
      crews: project.crews || legacyCrews,
    })),
  );

  const projectData = migratedProjects.reduce((acc, project) => {
    acc[project.id] = {
      crewRows: stored.crewRows,
      crewFinancials: stored.crewFinancials,
    };
    return acc;
  }, {});

  return { projects: migratedProjects, projectData };
};

function Home({ resetToken = 0 }) {
  const location = useLocation();
  const storedData = loadStoredData();
  const migratedLegacy = migrateLegacyData(storedData);
  const resolvedProjects =
    migratedLegacy?.projects ||
    ensureProjectIds(storedData?.projects || defaultProjects);
  const resolvedProjectData =
    migratedLegacy?.projectData ||
    storedData?.projectData ||
    buildProjectData(resolvedProjects, !storedData);

  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeCrewId, setActiveCrewId] = useState(null);
  const [projects, setProjects] = useState(resolvedProjects);
  const [projectData, setProjectData] = useState(resolvedProjectData);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProject, setNewProject] = useState({
    name: "",
    address: "",
    area: "",
    startDate: "",
    crewIds: [],
  });
  const [editProject, setEditProject] = useState({
    name: "",
    address: "",
    area: "",
    startDate: "",
  });
  const [newCrewName, setNewCrewName] = useState("");

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveProjectId(null);
      setActiveCrewId(null);
    }
  }, [location.key, location.pathname]);

  useEffect(() => {
    setActiveProjectId(null);
    setActiveCrewId(null);
  }, [resetToken]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [projects, activeProjectId],
  );

  const activeCrew = useMemo(() => {
    if (!activeProject) return null;
    return (
      (activeProject.crews || []).find((crew) => crew.id === activeCrewId) ||
      null
    );
  }, [activeProject, activeCrewId]);

  const activeRows = useMemo(() => {
    if (!activeProject || !activeCrewId) return [];
    return projectData[activeProject.id]?.crewRows?.[activeCrewId] || [];
  }, [activeProject, activeCrewId, projectData]);

  // Calculate the total amount for the active crew rows.
  const totalAmount = useMemo(() => {
    if (!activeCrewId) return 0;
    return activeRows.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
      0,
    );
  }, [activeCrewId, activeRows]);

  const paidAmount = useMemo(() => {
    if (!activeProject || !activeCrewId) return 0;
    return Number(
      projectData[activeProject.id]?.crewFinancials?.[activeCrewId]?.paid || 0,
    );
  }, [activeProject, activeCrewId, projectData]);

  const remainingAmount = useMemo(
    () => totalAmount - paidAmount,
    [totalAmount, paidAmount],
  );

  const isPaidInFull = totalAmount > 0 && remainingAmount <= 0;

  // Persist projects and per-project data to localStorage.
  useEffect(() => {
    const payload = {
      projects,
      projectData,
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [projects, projectData]);

  const handleSelectProject = (project) => {
    setActiveProjectId(project.id);
    setActiveCrewId(null);
  };

  const handleBackToProjects = () => {
    setActiveProjectId(null);
    setActiveCrewId(null);
  };

  const handleOpenProjectModal = () => {
    setNewProject({
      name: "",
      address: "",
      area: "",
      startDate: "",
      crewIds: [],
    });
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const handleOpenEditProjectModal = (project) => {
    setEditingProjectId(project.id);
    setEditProject({
      name: project.name || "",
      address: project.address || "",
      area: project.area || "",
      startDate: project.startDate || "",
    });
    setIsEditProjectModalOpen(true);
  };

  const handleCloseEditProjectModal = () => {
    setIsEditProjectModalOpen(false);
    setEditingProjectId(null);
  };

  const handleProjectFieldChange = (field, value) => {
    setNewProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditProjectFieldChange = (field, value) => {
    setEditProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleCrewSelection = (crewId) => {
    setNewProject((prev) => {
      const hasCrew = prev.crewIds.includes(crewId);
      const updatedCrewIds = hasCrew
        ? prev.crewIds.filter((id) => id !== crewId)
        : [...prev.crewIds, crewId];
      return { ...prev, crewIds: updatedCrewIds };
    });
  };

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    const projectId = `project-${Date.now()}`;
    const selectedCrews = newProject.crewIds.length
      ? newProject.crewIds
      : crewTemplates.map((crew) => crew.id);

    const crewList = selectedCrews.map((crewId) => ({
      id: crewId,
      name: crewTemplateMap[crewId]?.name || crewId,
    }));

    const createdProject = {
      id: projectId,
      name: newProject.name.trim(),
      address: newProject.address.trim(),
      area: newProject.area,
      startDate: newProject.startDate,
      status: "قيد التنفيذ",
      crews: crewList,
    };

    setProjects((prev) => [...prev, createdProject]);
    setProjectData((prev) => ({
      ...prev,
      [projectId]: {
        crewRows: crewList.reduce((acc, crew) => {
          acc[crew.id] = [];
          return acc;
        }, {}),
        crewFinancials: crewList.reduce((acc, crew) => {
          acc[crew.id] = { paid: "" };
          return acc;
        }, {}),
      },
    }));

    setIsProjectModalOpen(false);
  };

  const handleSaveProjectEdits = () => {
    if (!editingProjectId || !editProject.name.trim()) return;

    setProjects((prev) =>
      prev.map((project) =>
        project.id === editingProjectId
          ? {
              ...project,
              name: editProject.name.trim(),
              address: editProject.address.trim(),
              area: editProject.area,
              startDate: editProject.startDate,
            }
          : project,
      ),
    );

    setIsEditProjectModalOpen(false);
    setEditingProjectId(null);
  };

  const handleDeleteProject = (projectId) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    setProjectData((prev) => {
      const { [projectId]: removed, ...rest } = prev;
      return rest;
    });
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
      setActiveCrewId(null);
    }
  };

  const handleAddRow = () => {
    if (!activeProject || !activeCrewId) return;
    setProjectData((prev) => {
      const currentProject = prev[activeProject.id] || {
        crewRows: {},
        crewFinancials: {},
      };
      const existingRows = currentProject.crewRows?.[activeCrewId] || [];
      const newRow = {
        id: `${activeCrewId}-${Date.now()}`,
        date: getTodayISO(),
        material: "",
        unit: "متر",
        price: "",
        quantity: "",
        isEditing: true,
      };
      return {
        ...prev,
        [activeProject.id]: {
          ...currentProject,
          crewRows: {
            ...currentProject.crewRows,
            [activeCrewId]: [...existingRows, newRow],
          },
        },
      };
    });
  };

  const handleRowChange = (rowId, field, value) => {
    if (!activeProject || !activeCrewId) return;
    setProjectData((prev) => {
      const currentProject = prev[activeProject.id] || {
        crewRows: {},
        crewFinancials: {},
      };
      const updatedRows = (currentProject.crewRows?.[activeCrewId] || []).map(
        (row) => (row.id === rowId ? { ...row, [field]: value } : row),
      );
      return {
        ...prev,
        [activeProject.id]: {
          ...currentProject,
          crewRows: {
            ...currentProject.crewRows,
            [activeCrewId]: updatedRows,
          },
        },
      };
    });
  };

  const handleToggleEdit = (rowId) => {
    if (!activeProject || !activeCrewId) return;
    setProjectData((prev) => {
      const currentProject = prev[activeProject.id] || {
        crewRows: {},
        crewFinancials: {},
      };
      const updatedRows = (currentProject.crewRows?.[activeCrewId] || []).map(
        (row) =>
          row.id === rowId ? { ...row, isEditing: !row.isEditing } : row,
      );
      return {
        ...prev,
        [activeProject.id]: {
          ...currentProject,
          crewRows: {
            ...currentProject.crewRows,
            [activeCrewId]: updatedRows,
          },
        },
      };
    });
  };

  const handleDeleteRow = (rowId) => {
    if (!activeProject || !activeCrewId) return;
    setProjectData((prev) => {
      const currentProject = prev[activeProject.id] || {
        crewRows: {},
        crewFinancials: {},
      };
      const updatedRows = (
        currentProject.crewRows?.[activeCrewId] || []
      ).filter((row) => row.id !== rowId);
      return {
        ...prev,
        [activeProject.id]: {
          ...currentProject,
          crewRows: {
            ...currentProject.crewRows,
            [activeCrewId]: updatedRows,
          },
        },
      };
    });
  };

  const handlePaidChange = (value) => {
    if (!activeProject || !activeCrewId) return;
    setProjectData((prev) => {
      const currentProject = prev[activeProject.id] || {
        crewRows: {},
        crewFinancials: {},
      };
      return {
        ...prev,
        [activeProject.id]: {
          ...currentProject,
          crewFinancials: {
            ...currentProject.crewFinancials,
            [activeCrewId]: {
              ...currentProject.crewFinancials?.[activeCrewId],
              paid: value,
            },
          },
        },
      };
    });
  };

  const handleAddCrewToProject = () => {
    if (!activeProject || !newCrewName.trim()) return;
    const newCrewId = `crew-${Date.now()}`;
    const crewEntry = { id: newCrewId, name: newCrewName.trim() };

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProject.id
          ? {
              ...project,
              crews: [...(project.crews || []), crewEntry],
            }
          : project,
      ),
    );

    setProjectData((prev) => {
      const currentProject = prev[activeProject.id] || {
        crewRows: {},
        crewFinancials: {},
      };
      return {
        ...prev,
        [activeProject.id]: {
          ...currentProject,
          crewRows: {
            ...currentProject.crewRows,
            [newCrewId]: [],
          },
          crewFinancials: {
            ...currentProject.crewFinancials,
            [newCrewId]: { paid: "" },
          },
        },
      };
    });

    setNewCrewName("");
    setActiveCrewId(newCrewId);
  };

  const handlePrintCrew = () => {
    if (!activeCrew || !activeProject) return;
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
          <title>تقرير الكادر</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
            h1, h2, h3 { margin: 0 0 8px; }
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
            <div>المشروع: ${activeProject.name}</div>
            <div>الكادر: ${activeCrew.name}</div>
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
      {!activeProject ? (
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
              onClick={handleOpenProjectModal}
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
                    <span className="font-semibold">
                      {project.address || "-"}
                    </span>
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
                    الحالة:{" "}
                    <span className="font-semibold">{project.status}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                  onClick={() => handleSelectProject(project)}
                >
                  عرض الكوادر والحسابات
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
                    onClick={() => handleOpenEditProjectModal(project)}
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
                    onClick={() => handleDeleteProject(project.id)}
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
      ) : (
        <>
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                تفاصيل المشروع
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                {activeProject.name}
              </h2>
              <p className="text-sm text-slate-600">
                العنوان:{" "}
                <span className="font-semibold">
                  {activeProject.address || "-"}
                </span>
              </p>
              <p className="text-sm text-slate-600">
                المساحة:{" "}
                <span className="font-semibold">
                  {activeProject.area
                    ? Number(activeProject.area).toLocaleString("en-US")
                    : "-"}{" "}
                  م2
                </span>
              </p>
              <p className="text-sm text-slate-600">
                تاريخ البدء:{" "}
                <span className="font-semibold">
                  {activeProject.startDate || "-"}
                </span>
              </p>
              <p className="text-sm text-slate-600">
                الحالة:{" "}
                <span className="font-semibold">{activeProject.status}</span>
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              onClick={handleBackToProjects}
            >
              عودة
            </button>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">
              قائمة الكوادر
            </h3>
            <div className="flex flex-wrap gap-3">
              {(activeProject.crews || []).map((crew) => (
                <button
                  key={crew.id}
                  type="button"
                  className={`min-h-[44px] rounded-full border px-5 py-2 text-sm font-semibold transition ${
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
                onChange={(event) => setNewCrewName(event.target.value)}
                placeholder="إضافة كادر جديد (مثال: نجار)"
                className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
              />
              <button
                type="button"
                className="min-h-[44px] rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={handleAddCrewToProject}
              >
                إضافة كادر جديد
              </button>
            </div>
          </section>

          {activeCrew ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-semibold text-slate-900">
                  جدول الذرعة - {activeCrew.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-slate-600">
                    يتم احتساب المجموع تلقائيا
                  </span>
                  <button
                    type="button"
                    className="min-h-[44px] rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                    onClick={handleAddRow}
                  >
                    إضافة سطر جديد
                  </button>
                  <button
                    type="button"
                    className="min-h-[44px] rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                    onClick={handlePrintCrew}
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
                    {activeRows.map((item, index) => {
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
                                onChange={(event) =>
                                  handleRowChange(
                                    item.id,
                                    "date",
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
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
                                onChange={(event) =>
                                  handleRowChange(
                                    item.id,
                                    "material",
                                    event.target.value,
                                  )
                                }
                                placeholder="مثال: صبغ حائط"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
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
                                onChange={(event) =>
                                  handleRowChange(
                                    item.id,
                                    "unit",
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
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
                                onChange={(event) =>
                                  handleRowChange(
                                    item.id,
                                    "price",
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
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
                                onChange={(event) =>
                                  handleRowChange(
                                    item.id,
                                    "quantity",
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
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
                                className="min-h-[40px] rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                                onClick={() => handleToggleEdit(item.id)}
                              >
                                {item.isEditing ? "حفظ" : "تعديل"}
                              </button>
                              <button
                                type="button"
                                className="min-h-[40px] rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                                onClick={() => handleDeleteRow(item.id)}
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
                      <td
                        className="px-4 py-3 text-sm text-slate-600"
                        colSpan={6}
                      >
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
                    value={
                      projectData[activeProject.id]?.crewFinancials?.[
                        activeCrewId
                      ]?.paid ?? ""
                    }
                    onChange={(event) => handlePaidChange(event.target.value)}
                    className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none ${
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
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-600">
              اختر كادر من القائمة لعرض جدول الذرعة والحسابات.
            </section>
          )}
        </>
      )}

      {isProjectModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                إضافة مشروع جديد
              </h3>
              <button
                type="button"
                className="min-h-[40px] rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                onClick={handleCloseProjectModal}
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
                  onChange={(event) =>
                    handleProjectFieldChange("name", event.target.value)
                  }
                  placeholder="مثال: بناية الكرادة"
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                عنوان المشروع
                <input
                  type="text"
                  value={newProject.address}
                  onChange={(event) =>
                    handleProjectFieldChange("address", event.target.value)
                  }
                  placeholder="مثال: بغداد - شارع 62"
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                المساحة الكلية (م2)
                <input
                  type="number"
                  min="0"
                  value={newProject.area}
                  onChange={(event) =>
                    handleProjectFieldChange("area", event.target.value)
                  }
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                تاريخ البدء
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(event) =>
                    handleProjectFieldChange("startDate", event.target.value)
                  }
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none"
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
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      newProject.crewIds.includes(crew.id)
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newProject.crewIds.includes(crew.id)}
                      onChange={() => handleToggleCrewSelection(crew.id)}
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
                className="min-h-[44px] rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={handleCreateProject}
              >
                حفظ المشروع
              </button>
              <button
                type="button"
                className="min-h-[44px] rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                onClick={handleCloseProjectModal}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isEditProjectModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                تعديل بيانات المشروع
              </h3>
              <button
                type="button"
                className="min-h-[40px] rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                onClick={handleCloseEditProjectModal}
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
                  onChange={(event) =>
                    handleEditProjectFieldChange("name", event.target.value)
                  }
                  placeholder="مثال: مجمع الورد"
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                عنوان المشروع
                <input
                  type="text"
                  value={editProject.address}
                  onChange={(event) =>
                    handleEditProjectFieldChange("address", event.target.value)
                  }
                  placeholder="مثال: بغداد - اليرموك"
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                المساحة الكلية (م2)
                <input
                  type="number"
                  min="0"
                  value={editProject.area}
                  onChange={(event) =>
                    handleEditProjectFieldChange("area", event.target.value)
                  }
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                تاريخ البدء
                <input
                  type="date"
                  value={editProject.startDate}
                  onChange={(event) =>
                    handleEditProjectFieldChange(
                      "startDate",
                      event.target.value,
                    )
                  }
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-normal text-slate-700 focus:border-slate-900 focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="min-h-[44px] rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={handleSaveProjectEdits}
              >
                حفظ التعديلات
              </button>
              <button
                type="button"
                className="min-h-[44px] rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                onClick={handleCloseEditProjectModal}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Home;
