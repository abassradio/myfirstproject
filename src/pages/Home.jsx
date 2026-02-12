import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useProjectData } from "@/hooks/useProjectData";
import { useAuthContext } from "@/context/AuthContext";
import ProjectsList from "@/components/ProjectsList";
import ProjectDetail from "@/components/ProjectDetail";
import {
  ProjectCreateModal,
  ProjectEditModal,
} from "@/components/ProjectModals";

function Home({ resetToken = 0 }) {
  const location = useLocation();
  const {
    projects,
    projectData,
    createProject,
    updateProject,
    deleteProject,
    addCrewToProject,
    addRow,
    updateRow,
    toggleRowEdit,
    deleteRow,
    updatePaid,
  } = useProjectData();
  const { displayName } = useAuthContext();

  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeCrewId, setActiveCrewId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const activeProject =
    projects.find((project) => project.id === activeProjectId) || null;

  const handleSelectProject = (project) => {
    setActiveProjectId(project.id);
    setActiveCrewId(null);
  };

  const handleBackToProjects = () => {
    setActiveProjectId(null);
    setActiveCrewId(null);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateProject = async (projectInput) => {
    setIsLoading(true);
    try {
      await createProject(projectInput);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  const handleUpdateProject = async (editData) => {
    setIsLoading(true);
    try {
      await updateProject(editingProject.id, editData);
      setIsEditModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setIsLoading(true);
    try {
      await deleteProject(projectId);
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
        setActiveCrewId(null);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeProject) {
    return (
      <>
        <ProjectsList
          projects={projects}
          onSelectProject={handleSelectProject}
          onOpenCreateModal={handleOpenCreateModal}
          onOpenEditModal={handleOpenEditModal}
          onDeleteProject={handleDeleteProject}
        />
        <ProjectCreateModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateProject}
          isLoading={isLoading}
        />
        <ProjectEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateProject}
          project={editingProject}
          isLoading={isLoading}
        />
      </>
    );
  }

  return (
    <>
      <ProjectDetail
        project={activeProject}
        projectData={projectData}
        displayName={displayName}
        onBack={handleBackToProjects}
        onAddCrewToProject={(crewName) =>
          addCrewToProject(activeProject.id, crewName)
        }
        onAddRow={() => addRow(activeProject.id, activeCrewId)}
        onRowChange={(crewId, rowId, field, value) =>
          updateRow(activeProject.id, crewId, rowId, field, value)
        }
        onToggleEdit={(crewId, rowId) =>
          toggleRowEdit(activeProject.id, crewId, rowId)
        }
        onDeleteRow={(crewId, rowId) =>
          deleteRow(activeProject.id, crewId, rowId)
        }
        onPaidChange={(crewId, value) =>
          updatePaid(activeProject.id, crewId, value)
        }
        isLoading={isLoading}
      />
    </>
  );
}

export default Home;
