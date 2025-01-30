function randomId() {
  return Math.floor(Math.random() * 17 * 10000);
}
export default class UI {
  updateProjectTitle(el, text) {
    el.textContent = text;
  }

  taskShowMoreInfo({ originName, dateCreated, description, priority, date }) {
    return `
      <dialog class="taskMoreInfo" data-priority="${priority}">
        <p>"${description}"</p>
        <p>Deadline: ${date}</p>
        <p>Project: "${originName}"</p>
        <p>Priority: "${
          priority.charAt(0).toUpperCase() + priority.slice(1)
        }"</p>
        <p>Created In: ${dateCreated}</p>
        <button class="moreInfoCloseBtn">Close</button
      </dialog>
    `;
  }

  updateTaskListDiv(parentEl, list) {
    parentEl.remove();
    const taskListDiv = document.createElement("ul");
    taskListDiv.classList.add("taskListDiv");
    if (!list.length) {
      const div = document.createElement("div");
      div.textContent = "Project is empty.";
      taskListDiv.appendChild(div);
    }

    for (const taskObj of list) {
      const el = this.createTaskCard(taskObj);
      taskListDiv.insertAdjacentHTML("afterbegin", el);
    }
    return taskListDiv;
  }

  createTaskCard(taskObj) {
    return `
    <li class="taskCard ${taskObj.status ? "liDone" : ""}" data-id="${
      taskObj.id
    }" data-priority="${taskObj.priority}">
      <div class="taskStatusDiv">
      <input id="${taskObj.id}"type="checkbox" class="taskStatus" ${
      taskObj.status ? "checked" : ""
    } ></input>
      </div>
    
      <label for="${taskObj.id}" class="taskNameDiv">
        <span class="taskName ${taskObj.status ? "done" : ""}">${
      taskObj.name
    }</span>
        <div class="taskDate">Due: ${taskObj.date}</div>
      </label>

      <div class="taskBtnGrp">
        <button class="taskInfoBtn" >Notes</button>
        <button class="taskEditBtn" ${
          taskObj.status ? "disabled" : ""
        }>Edit</button>
        <button class="taskDeleteBtn">Delete</button>
      </div>
    </li>
`;
  }

  getFormInput(formEl, projectId, projectName) {
    const name = formEl.querySelector("#taskName").value;
    const description = formEl.querySelector("#description").value.trim();
    const priorityGrp = formEl.querySelectorAll(
      ".priorityGrp  label  input[name='priority']"
    );

    const priorityPick = [...priorityGrp].filter((el) => el.checked);
    const priority = priorityPick[0].value;
    const date = formEl.querySelector("#taskDate").value;
    const status = false;
    const originId = projectId;
    const originName = projectName;
    const dateCreated = new Date().toJSON().slice(0, 10);
    return {
      name,
      description,
      date,
      status,
      priority,
      originId,
      originName,
      dateCreated,
    };
  }

  createBtnGrp(divClassName, arr) {
    const div = document.createElement("div");
    div.setAttribute("class", divClassName);
    for (let i of arr) {
      const b = document.createElement("button");
      b.textContent = i.text;
      b.setAttribute(i.key, i.value);
      div.appendChild(b);
    }
    return div;
  }

  createTaskModal(isEditMode = false, taskObj = {}) {
    return `
    <dialog class="taskDialog">
    <form class="taskForm">
      <fieldset>
        <div class="taskTitle">${isEditMode ? "Edit" : "Add"} Task</div>
        <p>
        <label for="taskName"></label>
        Task Name: <input type="text" id="taskName" placeholder="TODO" required value="${
          isEditMode ? taskObj.name : ""
        }">      </input>
        </p>
        <p><label for="description">Description: </label><textarea required name="" id="description" placeholder="Add a note to your task." maxlength="50">${
          isEditMode ? taskObj.description : ""
        }
        </textarea></p>
        <div class="priorityGrp">
          <label for="high"><input type="radio" id="high" name="priority" value="high" ${
            isEditMode && taskObj.priority == "high" ? "checked" : "checked"
          }></input> <span class="priorityHigh"></span></label>
          <label for="medium"><input type="radio" id="medium" value="medium" name="priority" ${
            isEditMode && taskObj.priority == "medium" ? "checked" : ""
          }>        </input> <span class="priorityMedium"></span></label>
          <label for="low"><input type="radio" id="low" value="low" name="priority" ${
            isEditMode && taskObj.priority == "low" ? "checked" : ""
          }>        </input> <span class="priorityLow"></span></label>
        </div>
        <input type="date" value="${
          isEditMode ? taskObj.date : new Date().toJSON().slice(0, 10)
        }" id="taskDate"></input>
        <div class="taskModalBtnGrp">
        <button class="taskModalCloseBtn">Close</button>
        <button type="submit">${isEditMode ? "Confirm" : "Add"}</button>
        </div>
      </fieldset>
    </form>
    </dialog>
    `;
  }

  createProjectModal = (el, callback, isEditMode = false, projectObj = {}) => {
    const dialog = document.createElement("dialog");
    dialog.classList.add("projectDialog");

    const form = document.createElement("form");
    form.classList.add("projectForm");
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Project Name");
    const btnGrp = this.createBtnGrp("projectBtnGrp", [
      { text: "Close", key: "class", value: "projectModalCloseBtn" },
      { text: `${isEditMode ? "Done" : "Add"}`, key: "type", value: "submit" },
    ]);

    const title = document.createElement("p");

    form.append(input, btnGrp);
    dialog.append(title, form);
    const close = dialog.querySelector(".projectModalCloseBtn");
    const add = dialog.querySelector("button[type='submit']");
    if (isEditMode) {
      add.focus();
      title.textContent = "Edit Project";
      dialog.insertAdjacentElement("beforebegin", title);
      input.value = projectObj.name;
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        callback({
          ...projectObj,
          name: input.value,
        });
        this.updateNotification(el, "Project Edited Successfully!", "edited");
        form.reset();
        dialog.close();
      });
      return dialog;
    } else {
      title.textContent = "Add Project";
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        callback(form.querySelector("input").value || "Project Name");
        this.updateNotification(el, "New Project Added!", "success");
        form.reset();
        dialog.close();
      });

      close.addEventListener("click", (e) => {
        e.preventDefault();
        dialog.close();
      });
      return dialog;
    }
  };

  projectShowDeleteModal = (el, project, onProjectDelete, onProjectEdit) => {
    const modal = el.querySelector(".projectDeleteDialog");
    const title = modal.querySelector(".deleteModalTitle");
    const deleteBtn = modal.querySelector(".projectDeleteModalBtnGrp");
    const edit = modal.querySelector(".projectEditBtn");
    title.textContent = `${project.name}`;

    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      onProjectDelete();
      this.updateNotification(el, "Project Deleted!", "delete");
      modal.close();
    });

    edit.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (el.querySelector(".projectDialog")) {
        el.querySelector(".projectDialog").remove();
      }
      const dialog = this.createProjectModal(el, onProjectEdit, true, project);
      el.appendChild(dialog);
      dialog.showModal();
      modal.close();
    });
    modal.showModal();
  };

  updateNotification = (el, message, className) => {
    const notification = el.querySelector(".notification");
    notification.textContent = message;
    // notification.setAttribute("id", className);
    notification.classList.add(className);

    setTimeout(() => {
      notification.textContent = "";
      notification.classList.remove(className);
      // notification.removeAttribute("id");
    }, 2000);
  };

  updateProjectsList = (el, list) => {
    const projectListDiv = el.querySelector(".projectListDiv");
    projectListDiv.textContent = "";
    for (let i = 0; i < list.length; ++i) {
      const projectEl = this.createProjectElement(list[i]);
      projectListDiv.appendChild(projectEl);
    }
  };

  createProjectElement = (project) => {
    const list = document.createElement("li");
    const projectEl = document.createElement("button");
    projectEl.setAttribute("class", "projectItem");
    projectEl.setAttribute("data-id", project.id);
    projectEl.textContent = project.name;

    list.appendChild(projectEl);
    return list;
  };
}
