import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";

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

const mapSupabaseProject = (row) => ({
  id: row.id,
  name: row.name || "",
  address: row.address || "",
  area: row.area ?? "",
  startDate: row.start_date || row.startDate || "",
  status: row.status || "قيد التنفيذ",
  crews: row.crews?.length ? row.crews : getDefaultProjectCrews(),
});

const buildRowsFromTemplate = (crewId, useSamples) => {
  const template = crewTemplateMap[crewId];
  if (!useSamples || !template?.measurements?.length) return [];
  const today = new Date().toISOString().slice(0, 10);
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

export const useProjectData = () => {
  const storedData = loadStoredData();
  const migratedLegacy = migrateLegacyData(storedData);
  const resolvedProjects =
    migratedLegacy?.projects ||
    ensureProjectIds(storedData?.projects || defaultProjects);
  const resolvedProjectData =
    migratedLegacy?.projectData ||
    storedData?.projectData ||
    buildProjectData(resolvedProjects, !storedData);

  const [projects, setProjects] = useState(resolvedProjects);
  const [projectData, setProjectData] = useState(resolvedProjectData);
  const { displayName } = useAuthContext();

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch projects error:", error);
        return;
      }

      if (!isMounted) return;
      const mappedProjects = (data || []).map(mapSupabaseProject);
      setProjects(mappedProjects);
      setProjectData((prev) => {
        const next = { ...prev };
        mappedProjects.forEach((project) => {
          if (!next[project.id]) {
            next[project.id] = {
              crewRows: (project.crews || []).reduce((acc, crew) => {
                acc[crew.id] = [];
                return acc;
              }, {}),
              crewFinancials: (project.crews || []).reduce((acc, crew) => {
                acc[crew.id] = { paid: "" };
                return acc;
              }, {}),
            };
          }
        });
        return next;
      });
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const payload = {
      projects,
      projectData,
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [projects, projectData]);

  const createProject = async (projectInput) => {
    const selectedCrews = projectInput.crewIds.length
      ? projectInput.crewIds
      : crewTemplates.map((crew) => crew.id);

    const crewList = selectedCrews.map((crewId) => ({
      id: crewId,
      name: crewTemplateMap[crewId]?.name || crewId,
    }));

    const payload = {
      name: projectInput.name.trim(),
      address: projectInput.address.trim(),
      area: projectInput.area || null,
      start_date: projectInput.startDate || null,
      status: "قيد التنفيذ",
    };
    // attach creator name (from auth metadata) if available
    if (displayName) payload.created_by = displayName;

    const { data, error } = await supabase
      .from("projects")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase insert project error:", error);
      throw error;
    }

    const createdProject = {
      ...mapSupabaseProject(data),
      crews: crewList,
    };

    setProjects((prev) => [createdProject, ...prev]);
    setProjectData((prev) => ({
      ...prev,
      [createdProject.id]: {
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
  };

  const updateProject = async (projectId, editData) => {
    const updates = {
      name: editData.name.trim(),
      address: editData.address.trim(),
      area: editData.area || null,
      start_date: editData.startDate || null,
    };

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase update project error:", error);
      throw error;
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              ...mapSupabaseProject(data),
              crews: project.crews,
            }
          : project,
      ),
    );
  };

  const deleteProject = async (projectId) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Supabase delete project error:", error);
      throw error;
    }

    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    setProjectData((prev) => {
      const { [projectId]: _, ...rest } = prev;
      return rest;
    });
  };

  const addCrewToProject = (projectId, crewName) => {
    const newCrewId = `crew-${Date.now()}`;
    const crewEntry = { id: newCrewId, name: crewName };

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              crews: [...(project.crews || []), crewEntry],
            }
          : project,
      ),
    );

    setProjectData((prev) => {
      const currentProject = prev[projectId] || {
        crewRows: {},
        crewFinancials: {},
      };
      return {
        ...prev,
        [projectId]: {
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

    return newCrewId;
  };

  const addRow = (projectId, crewId) => {
    setProjectData((prev) => {
      const currentProject = prev[projectId] || {
        crewRows: {},
        crewFinancials: {},
      };
      const existingRows = currentProject.crewRows?.[crewId] || [];
      const newRow = {
        id: `${crewId}-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        material: "",
        unit: "متر",
        price: "",
        quantity: "",
        isEditing: true,
      };
      return {
        ...prev,
        [projectId]: {
          ...currentProject,
          crewRows: {
            ...currentProject.crewRows,
            [crewId]: [...existingRows, newRow],
          },
        },
      };
    });
  };

  const updateRow = (projectId, crewId, rowId, field, value) => {
    setProjectData((prev) => {
      const currentProject = prev[projectId] || {
        crewRows: {},
        crewFinancials: {},
      };
      const updatedRows = (currentProject.crewRows?.[crewId] || []).map(
        (row) => (row.id === rowId ? { ...row, [field]: value } : row),
      );
      return {
        ...prev,
        [projectId]: {
          ...currentProject,
          crewRows: {
            ...currentProject.crewRows,
            [crewId]: updatedRows,
          },
        },
      };
    });
  };

  const toggleRowEdit = (projectId, crewId, rowId) => {
    setProjectData((prev) => {
      const currentProject = prev[projectId] || {
        crewRows: {},
        crewFinancials: {},
      };
      const updatedRows = (currentProject.crewRows?.[crewId] || []).map(
        (row) =>
          row.id === rowId ? { ...row, isEditing: !row.isEditing } : row,
      );
      return {
        ...prev,
        [projectId]: {
          ...currentProject,
          crewRows: {
            ...currentProject.crewRows,
            [crewId]: updatedRows,
          },
        },
      };
    });
  };

  const deleteRow = (projectId, crewId, rowId) => {
    setProjectData((prev) => {
      const currentProject = prev[projectId] || {
        crewRows: {},
        crewFinancials: {},
      };
      const updatedRows = (currentProject.crewRows?.[crewId] || []).filter(
        (row) => row.id !== rowId,
      );
      return {
        ...prev,
        [projectId]: {
          ...currentProject,
          crewRows: {
            ...currentProject.crewRows,
            [crewId]: updatedRows,
          },
        },
      };
    });
  };

  const updatePaid = (projectId, crewId, value) => {
    setProjectData((prev) => {
      const currentProject = prev[projectId] || {
        crewRows: {},
        crewFinancials: {},
      };
      return {
        ...prev,
        [projectId]: {
          ...currentProject,
          crewFinancials: {
            ...currentProject.crewFinancials,
            [crewId]: {
              ...currentProject.crewFinancials?.[crewId],
              paid: value,
            },
          },
        },
      };
    });
  };

  return {
    projects,
    projectData,
    crewTemplates,
    crewTemplateMap,
    createProject,
    updateProject,
    deleteProject,
    addCrewToProject,
    addRow,
    updateRow,
    toggleRowEdit,
    deleteRow,
    updatePaid,
  };
};

export { crewTemplates, crewTemplateMap };
