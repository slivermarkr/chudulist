import Todo from "./todo.js";
import UI from "./ui.js";

export default class App {
  constructor(root) {
    this.root = root;
    this.todo = new Todo();
    this.ui = new UI();
    this.activeProjectId = this.todo.getProjectsList()[0] || undefined;
    this.activeTask = undefined;
    this.status = {
      isTaskOnEditMode: false,
      onAllTaskTab: true,
    };

    this.initApi();
    this.initHTML();
    this.ui.updateProjectsList(this.root, this.todo.getProjectsList());
    this.showAllTasks();
    this.createTaskModal();
    this.listener();
  }

  initApi() {
    if (!this.todo.getProjectsList().length) {
      let arr = this.todo.createDefaultProjects();
      this.todo.saveDefaultProjects(arr);
    }
    return;
  }
  showAllTasks() {
    this.onTaskListUpdate(this.todo.getTaskList(), "All Tasks");
    document.querySelector(".showTaskModalBtn").classList.add("hide");
    this.hlProject(this.root.querySelector(".defaultProject"));
  }

  onTaskListUpdate(taskList, projectname) {
    this.ui.updateProjectTitle(
      document.querySelector(".projectTitle"),
      projectname
    );
    const taskMain = this.root.querySelector(".taskMain");
    taskMain.append(
      this.ui.updateTaskListDiv(
        document.querySelector(".taskListDiv"),
        taskList
      )
    );
  }

  projectShowModal(el, onProjectAdd) {
    if (el.querySelector(".projectDialog")) {
      el.querySelector(".projectDialog").remove();
    }
    const dialog = this.ui.createProjectModal(el, onProjectAdd);
    el.appendChild(dialog);

    dialog.showModal();
  }

  onProjectClick = (el) => {
    const id = el.dataset.id;
    const project = this.todo.getActiveProject(id);
    this.activeProjectId = project;
    this.onTaskListUpdate(
      this.todo.getProjectTaskList(project.id),
      project.name
    );
    this.hlProject(el);
  };

  hlProject(el) {
    this.root.querySelectorAll(".projectItem").forEach((button) => {
      button.classList.remove("clicked");
    });
    this.root.querySelector(".defaultProject").classList.remove("clicked");
    el.classList.add("clicked");
  }

  onProjectDblClick = (el) => {
    const id = el.dataset.id;
    const project = this.todo.getActiveProject(id);
    this.activeProjectId = project;
    this.ui.projectShowDeleteModal(
      this.root,
      project,
      this.onProjectDelete,
      this.onProjectEdit
    );
  };

  onTaskAdd(taskObj) {
    const task = this.todo.createTask(taskObj);
    this.activeTask = task;
    this.ui.updateNotification(this.root, "New Task Added!", "success");
  }

  createTaskModal(status = false, taskParams = undefined) {
    if (document.querySelector(".taskDialog")) {
      document.querySelector(".taskDialog").remove();
    }
    const taskDiv = this.root.querySelector(".taskDiv");
    taskDiv.insertAdjacentHTML(
      "afterbegin",
      this.ui.createTaskModal(status, taskParams)
    );

    const form = this.root.querySelector(".taskForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const taskObj = this.ui.getFormInput(
        form,
        this.activeProjectId.id,
        this.activeProjectId.name
      );

      if (status) {
        this.onTaskEdit({ ...taskParams, ...taskObj });
      } else {
        this.onTaskAdd(taskObj);
      }

      if (this.status.onAllTaskTab && status) {
        this.showAllTasks();
      } else {
        const taskList = this.todo.getProjectTaskList(this.activeProjectId.id);
        this.activeProjectId = this.todo.getActiveProject(
          this.activeProjectId.id
        );

        this.onTaskListUpdate(taskList, this.activeProjectId.name);
      }
      document.querySelector(".taskDialog").close();
      form.reset();
    });
  }

  onTaskShowModal() {
    const taskModal = this.root.querySelector(".taskDialog");
    taskModal.showModal();
  }

  getActiveTask(el) {
    const taskId = el.closest("li").dataset.id;
    return this.todo.getActiveTask(taskId);
  }

  showMoreTaskInfo(task) {
    if (document.querySelector(".taskMoreInfo")) {
      document.querySelector(".taskMoreInfo").remove();
    }
    const taskDiv = this.root.querySelector(".taskDiv");
    taskDiv.insertAdjacentHTML("afterbegin", this.ui.taskShowMoreInfo(task));
    document.querySelector(".taskMoreInfo").showModal();
  }

  styleTaskCard(status, el) {
    const li = el.closest("li");
    if (status) {
      li.classList.add("liDone");
      li.querySelector(".taskName").classList.add("done");
      // li.querySelector(".taskInfoBtn").disabled = true;
      li.querySelector(".taskEditBtn").disabled = true;
    } else {
      li.classList.remove("liDone");
      li.querySelector(".taskName").classList.remove("done");
      // li.querySelector(".taskInfoBtn").disabled = false;
      li.querySelector(".taskEditBtn").disabled = false;
    }
  }

  onTaskEdit(task) {
    this.todo.editTask(task);
    this.ui.updateNotification(
      this.root,
      "Task Edited Successfully!",
      "edited"
    );
  }
  onTaskDelete(task, status) {
    this.todo.deleteTask(task.id);
    if (status) {
      this.showAllTasks();
    } else {
      this.onTaskListUpdate(
        this.todo.getProjectTaskList(task.originId),
        task.originName
      );
    }
    this.ui.updateNotification(this.root, "Task Deleted!", "delete");
  }

  listener = () => {
    this.root.addEventListener("click", (e) => {
      if (e.target.classList.contains("projectDeleteDialogCloseBtn")) {
        this.root.querySelector(".projectDeleteDialog").close();
      }

      if (e.target.classList.contains("taskDeleteBtn")) {
        const task = this.getActiveTask(e.target);
        this.activeProjectId = this.todo.getActiveProject(task.originId);
        this.onTaskDelete(task, this.status.onAllTaskTab);
      }
      if (e.target.classList.contains("taskEditBtn")) {
        const task = this.getActiveTask(e.target);
        this.activeProjectId = this.todo.getActiveProject(task.originId);
        this.createTaskModal(true, task);
        this.onTaskShowModal();
      }

      if (e.target.classList.contains("moreInfoCloseBtn")) {
        document.querySelector(".taskMoreInfo").close();
      }

      if (e.target.classList.contains("taskInfoBtn")) {
        const task = this.getActiveTask(e.target);
        this.showMoreTaskInfo(task);
      }

      if (e.target.classList.contains("taskStatus")) {
        const task = this.getActiveTask(e.target);
        task.status = e.target.checked;
        this.styleTaskCard(task.status, e.target);
        this.todo.editTask(task);
      }

      if (e.target.classList.contains("defaultProject")) {
        document.querySelector(".showTaskModalBtn").classList.add("hide");
        this.onTaskListUpdate(this.todo.getTaskList(), "All Tasks");
        this.hlProject(e.target);
        this.status.onAllTaskTab = true;
      }

      if (e.target.classList.contains("taskModalCloseBtn")) {
        e.preventDefault();
        document.querySelector(".taskDialog").close();
      }

      if (e.target.classList.contains("showTaskModalBtn")) {
        this.createTaskModal();
        this.onTaskShowModal();
      }

      if (e.target.classList.contains("showProjectModalBtn")) {
        this.projectShowModal(this.root, this.onProjectAdd);
      }

      if (e.target.classList.contains("projectItem")) {
        document.querySelector(".showTaskModalBtn").classList.remove("hide");
        this.status.onAllTaskTab = false;
        const project = this.todo.getActiveProject(e.target.dataset.id);
        this.activeProjectId = project;
        this.onProjectClick(e.target);
      }
    });

    this.root.addEventListener("dblclick", (e) => {
      if (e.target.classList.contains("projectItem")) {
        this.onProjectDblClick(e.target);
      }
    });
  };

  onProjectDelete = () => {
    this.todo.deleteProject(this.activeProjectId.id);
    this.ui.updateProjectsList(this.root, this.todo.getProjectsList());
    this.activeProjectId = undefined;
    this.status.onAllTaskTab = true;
    this.showAllTasks();
  };

  onProjectEdit = (projectObject) => {
    this.todo.editProject(projectObject);
    this.ui.updateProjectsList(this.root, this.todo.getProjectsList());

    const taskList = this.todo.getProjectTaskList(projectObject.id);
    taskList.forEach((task) => {
      task.originName = projectObject.name;
      this.todo.editTask(task);
    });
    this.onTaskListUpdate(
      this.todo.getProjectTaskList(this.activeProjectId.id),
      this.activeProjectId.name
    );
    const projectListDiv = this.root.querySelector(".projectListDiv");
    this.hlProject(
      projectListDiv.querySelector(`li > button[data-id="${projectObject.id}"]`)
    );
    this.ui.updateProjectTitle(
      document.querySelector(".projectTitle"),
      projectObject.name
    );
  };

  onProjectAdd = (projectName) => {
    const project = this.todo.createProject(projectName);
    this.activeProjectId = project;
    this.ui.updateProjectsList(this.root, this.todo.getProjectsList());
    this.onTaskListUpdate(project.getTaskList(), project.name);
    const projectListDiv = this.root.querySelector(".projectListDiv");
    this.hlProject(
      projectListDiv.querySelector(
        `li > button[data-id="${this.activeProjectId.id}"]`
      )
    );
    document.querySelector(".showTaskModalBtn").classList.remove("hide");
  };

  initHTML() {
    this.root.innerHTML = `
      <p class="notification"></p>
      <h2 class="projectTitle">Project One</h2>
      <div class="mainCard">
        <div class="projectDiv">
          <button class="showProjectModalBtn">Add Project</button>
          <button class="defaultProject" data-id="0">All Tasks</button>
          <dialog type="modal" class="projectDialog">
           <form class="projectForm">
            <input type="text" placeholder="Project Name"></input>
            <div class="projectModalBtnGrp">
             <button class="projectModalCloseBtn">Close</button>
             <button>Add</button>
            </div>
           </form>
          </dialog>
          <dialog class="projectDeleteDialog">
            <span class="projectDeleteDialogCloseBtn">X</span>
            <div class="deleteModalTitle">
            </div>
            <div class="projectDeleteModalBtnGrp">
             <button class="projectDeleteModalCloseBtn">Delete</button>
             <button class="projectEditBtn">Edit</button>
            </div>
          </dialog>
          <div class="projectMain">
            <ul class="projectListDiv">
            </ul>
          </div>
        </div>
        <div class="taskDiv">
          <button class="showTaskModalBtn">Add Task</button>
          <div class="taskMain">
            <ul class="taskListDiv">
            </ul>
          </div>
        </div>
      </div>
   `;
  }
}
