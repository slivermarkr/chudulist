function randomId() {
  return Math.floor(Math.random() * 17 * 10000);
}

class Storage {
  static getProjectListFromStorage() {
    return Storage.queryToLocalStorage("projects");
  }

  static setProjectListToStorage(list) {
    Storage.setToLocalStorage("projects", list);
  }

  static getTaskListFromStorage() {
    return Storage.queryToLocalStorage("tasks");
  }

  static setTaskListToStorage(list) {
    Storage.setToLocalStorage("tasks", list);
  }

  static queryToLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  static setToLocalStorage(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }
}

export default class Todo {
  getProjectsList() {
    return Storage.getProjectListFromStorage();
  }

  createProject(projectName) {
    const project = new Project({ name: projectName, id: randomId() });
    const list = this.getProjectsList();
    list.push(project);
    this.saveProject(list);
    return project;
  }

  getActiveProject = (projectId) => {
    const project = this.getProjectsList().find(
      (project) => project.id == +projectId
    );
    return project;
  };

  getActiveTask = (taskId) => {
    const task = this.getTaskList().find((task) => task.id == +taskId);
    return task;
  };

  saveProject(list) {
    Storage.setProjectListToStorage(list);
  }

  editProject(project) {
    const list = this.getProjectsList();
    let projectIndex = list.findIndex((p) => p.id == project.id);

    list[projectIndex] = {
      ...list[projectIndex],
      ...project,
    };
    this.saveProject(list);
  }

  deleteProject(projectId) {
    const list = Storage.getProjectListFromStorage();
    const projectsTaskList = this.getProjectTaskList(projectId);

    if (projectsTaskList.length) {
      for (const el of projectsTaskList) {
        this.deleteTask(el.id);
      }
    }

    const newList = list.filter((project) => projectId != project.id);

    this.saveProject(newList);
  }

  getTaskList() {
    return Storage.getTaskListFromStorage();
  }

  createTask(taskObj) {
    const task = new Task(taskObj);
    const list = this.getTaskList();
    list.push(task);
    this.saveTask(list);
    return task;
  }

  saveTask(list) {
    Storage.setTaskListToStorage(list);
  }

  deleteTask(taskId) {
    const list = Storage.getTaskListFromStorage();
    const newList = list.filter((task) => taskId != task.id);
    this.saveTask(newList);
  }

  editTask(taskObj) {
    const list = this.getTaskList();
    let taskIndex = list.findIndex((task) => task.id == taskObj.id);
    if (taskIndex == -1) {
      throw new Error("ERROR: Task not found");
    }

    list[taskIndex] = {
      ...list[taskIndex],
      ...taskObj,
    };
    this.saveTask(list);
  }

  getProjectTaskList(projectId) {
    const taskList = this.getTaskList();
    const projectList = this.getProjectsList();
    const projectIndex = projectList.findIndex(
      (project) => project.id == projectId
    );

    const project = new Project(projectList[projectIndex]);

    const arrOfTasks = taskList.filter((task) => project.id == task.originId);

    project.setTaskList(arrOfTasks);

    projectList[projectIndex] = project;
    this.saveProject(projectList);
    return project.getTaskList();
  }

  createDefaultProjects() {
    const array = [
      new Project({
        name: "Hello World",
        id: 69,
        taskList: [
          this.createTask({
            id: randomId(),
            name: "Hi Mom!",
            description: "Mamamia",
            originId: 69,
            originName: "Hello World",
            dateCreated: new Date().toJSON().slice(0, 10),
            date: new Date().toJSON().slice(0, 10),
            priority: "high",
          }),
        ],
      }),
      new Project({
        name: "Project Two",
        id: 420,
        taskList: [
          this.createTask({
            id: randomId(),
            name: "Task 1",
            description: "Why are you geh??",
            originId: 420,
            originName: "Project Two",
            dateCreated: new Date().toJSON().slice(0, 10),
            date: new Date().toJSON().slice(0, 10),
            priority: "low",
          }),
          this.createTask({
            id: randomId(),
            name: "Task Two",
            description: "Who is geh?",
            originId: 420,
            originName: "Project Two",
            dateCreated: new Date().toJSON().slice(0, 10),
            date: new Date().toJSON().slice(0, 10),
            priority: "medium",
            status: true,
          }),
        ],
      }),
      new Project({
        name: "Project Three",
        id: 666,
        taskList: [
          this.createTask({
            id: randomId(),
            name: "Task One",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            originId: 666,
            originName: "Project Three",
            dateCreated: new Date().toJSON().slice(0, 10),
            date: new Date().toJSON().slice(0, 10),
            priority: "high",
            status: false,
          }),
          this.createTask({
            id: randomId(),
            name: "Task Two",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            originId: 666,
            originName: "Project Three",
            dateCreated: new Date().toJSON().slice(0, 10),
            date: new Date().toJSON().slice(0, 10),
            priority: "low",
            status: false,
          }),
          this.createTask({
            id: randomId(),
            name: "Task Three",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            originId: 666,
            originName: "Project Three",
            dateCreated: new Date().toJSON().slice(0, 10),
            date: new Date().toJSON().slice(0, 10),
            priority: "medium",
            status: true,
          }),
        ],
      }),
    ];
    return array;
  }
  saveDefaultProjects(arr) {
    const list = this.getProjectsList();
    for (let i = 0; i < arr.length; ++i) {
      list.push(arr[i]);
    }
    this.saveProject(list);
  }
}

class Project {
  constructor({
    name,
    id = undefined,
    taskList = [],
    date = new Date().toJSON().slice(0, 10),
  } = {}) {
    this.name = name;
    this.id = id;
    this.taskList = taskList;
    this.date = date;
  }

  setTaskList(list) {
    this.taskList = list;
  }

  getTaskList() {
    return this.taskList;
  }
}

class Task {
  constructor({
    id = randomId(),
    name,
    description,
    priority,
    status = false,
    date,
    originId,
    dateCreated,
    originName,
  }) {
    this.name = name;
    this.id = id;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.date = date;
    this.originId = originId;
    this.originName = originName;
    this.dateCreated = dateCreated;
  }
}
