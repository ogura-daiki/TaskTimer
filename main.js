
import { LitElement, html, css, live, repeat } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

let cnt = 0;
const dateFormat = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short' })
const timeFormat = new Intl.DateTimeFormat('ja-JP', { timeStyle: 'short' })

class TaskTimer extends LitElement {
  static get properties() {
    return {
      tasks: { type: Array },
      openAddDialog: { state: true },
      openCopyDialog: { state: true },
    }
  }
  static get styles() {
    return css`
    :host{
      display:block;
      position:relative;
    }
    .col{
      display:flex;
      flex-flow:column nowrap;
      gap:8px;
    }
    .row{
      display:flex;
      flex-flow:row nowrap;
      gap:8px;
    }
    .grow{
      flex-basis:0px;
      flex-grow:1;
    }
    .centering{
      display:flex;
      place-items:center;
      justify-content:center;
    }
    .gap-0{
      gap:0px;
    }
    .gap-16{
      gap:16px;
    }
    .main-content{
      width:100%;
      height:100%;
    }
    .main-content>* + *{
      border-top:1px solid lightgray;
    }
    .pageTitle{
      padding:8px 16px;
      font-size:1.6em;
    }
    .backdrop{
      position:absolute;
      width:100%;
      height:100%;
      top:0px;
      left:0px;
      background:rgba(0,0,0,.2);
    }
    .dialog{
      background:rgb(240,240,240);
      min-height:max(100px, min-content);
      max-height:70vh;
      height:300px;
      width:min(max(100px, 100% - 36px), 300px);
    }
    .dialog .bar{
      border-bottom:1px solid lightgray;
      padding:8px;
    }
    .dialog .content{
      overflow-y:scroll;
      padding:8px;
    }
    .task-item{
      padding:8px;
      border-radius:8px;
      border:1px solid lightgray;
    }
    .menu{
      padding:8px;
    }
    textarea{
      resize:vertical;
    }
    .noresize{
      resize:none;
    }
    .task_list{
      overflow-y:scroll;
      padding:8px;
      box-sizing:border-box;
      flex-direction:column-reverse;
    }
    `;
  }
  constructor() {
    super();

    this.tasks = JSON.parse(localStorage.getItem("tasktimer-tasks") || "[]");
    this.openAddDialog = false;
    this.openCopyDialog = false;
  }
  getTimeStr(time = new Date()) {
    return `${("" + time.getHours()).padStart(2, 0)}:${("" + time.getMinutes()).padStart(2, 0)}`;
  }
  addTask() {
    if (!this.inputName) return;
    this.openAddDialog = false;
    this.tasks.forEach(task => {
      if (!task.to) task.to = this.getTimeStr();
    })
    this.tasks.splice(this.insertTo, 0, {
      id: cnt++,
      name: this.inputName,
      memo: this.inputMemo,
      from: this.getTimeStr(),
      to: undefined,
    });
    this.inputName = "";
    this.inputMemo = "";
  }
  addDialog() {
    return html`
        <div class="backdrop centering">
          <div class="dialog col gap-0">
            <div class="row bar">
              <div class="title grow">
                タスクを追加
              </div>
              <button @click=${e => {
        this.openAddDialog = false;
      }}>×</button>
            </div>
            <div class="col grow content" style="overflow-y:scroll">
              <div class="row">
                <input
                  type="text"
                  class="grow"
                  id="inputName"
                  placeholder="タイトル"
                  value=${this.inputName}
                  @input=${e => this.inputName = e.target.value}
                  @keydown=${e => { if (e.key === "Enter" && e.ctrlKey) this.addTask(); }}
                >
                <button
                  @click=${e => {
        this.inputName = "";
        this.renderRoot.querySelector("#inputName").value = "";
      }}
                >
                  ×
                </button>
              </div>
              <div class="row grow">
                <textarea
                  id="inputMemo"
                  class="grow noresize"
                  placeholder="メモ"
                  @input=${e => this.inputMemo = e.target.value}
                  @keydown=${e => { if (e.key === "Enter" && e.ctrlKey) this.addTask(); }}
                >${this.inputMemo}</textarea>
                <button
                  @click=${e => {
        this.inputMemo = "";
        this.renderRoot.querySelector("#inputMemo").value = "";
      }}
                >
                  ×
                </button>
              </div>
              <button @click=${e => { this.addTask(); }}>追加</button>
            </div>
          </div>
        </div>
      `;
  }
  copyDialog() {
    return html`
        <div class="backdrop centering">
          <div class="dialog col gap-0">
            <div class="row bar">
              <div class="title grow">
                タスク時系列コピー
              </div>
              <button @click=${e => this.openCopyDialog = false}>×</button>
            </div>
            <div class="col grow content" style="overflow-y:scroll">
              <textarea class="noresize grow">${this.tasks.map(task => {
      return `${task.from}～${task.to || this.getTimeStr()} ${task.name}${task.memo ? `\n${task.memo.split("\n").map(s => "  " + s).join("\n")}` : ""}`;
    }).reverse().join("\n")
      }</textarea>
            </div>
          </div>
        </div>
      `;
  }
  timeInput(task, name) {
    return html`
      <input
        type="time" value="${task[name]}"
        @input=${e => task[name] = e.target.value}
      >
      `
  }
  taskView(task, i) {
    return html`
        <div class="col task-item">
          <input 
            type="text" .value=${task.name}
            @input=${e => {
        task.name = e.target.value;
      }} style="font-size:1.2em"
          >
          <textarea @input=${e => task.memo = e.target.value}>${task.memo}</textarea>
          <div class="row">
            ${this.timeInput(task, "from")}
            <span>～</span>
            ${task.to ? this.timeInput(task, "to") : "実施中"}
          </div>
          
          <div class="row">
            <button
              ?disabled=${task.to}
              @click=${e => {
        task.to = this.getTimeStr();
        this.requestUpdate();
      }}
            >
              完了
            </button>
            <button
              ?disabled=${!task.to}
              @click=${e => {
        if (confirm(`タスク名：${task.name} の完了を取り消しますか？`)) {
          task.to = undefined;
          this.requestUpdate();
        }
      }}
            >
              未完了
            </button>
            <button
              @click=${e => {
        this.inputName = task.name;
        this.inputMemo = task.memo;
        this.openAddDialog = true;
      }}
            >複製</button>
            <button
              @click=${e => {
        if (confirm(`タスク名：${task.name}を削除しますか？`)) {
          const idx = this.tasks.findIndex(t => t === task);
          this.tasks.splice(idx, 1);
          this.requestUpdate();
        }
      }}
            >削除</button>
          </div>
        </div>
        <button @click=${e => {
        this.insertTo = i + 1;
        this.openAddDialog = true;
      }}>＋</button>
      `;
  }
  render() {
    localStorage.setItem("tasktimer-tasks", JSON.stringify(this.tasks));
    return html`
        <div class="col gap-0 main-content">
          <span class="pageTitle">打刻（簡易）</span>
          <div class="grow col task_list">
            <button @click=${e => {
        this.insertTo = 0;
        this.openAddDialog = true;
      }}>＋</button>
            ${repeat(this.tasks, t => t.id, (t, i) => this.taskView(t, i))}
          </div>
          <div class="row menu">
            <button @click=${e => {
        this.insertTo = 0;
        this.openAddDialog = true;
      }}>追加</button>
            <button @click=${e => {
        this.insertTo = 0;
        this.inputName = "トイレ";
        this.openAddDialog = true;
      }}>トイレ</button>
            <button @click=${e => {
        this.insertTo = 0;
        this.inputName = "相談MTG";
        this.openAddDialog = true;
      }}>相談MTG</button>
            <button @click=${e => this.openCopyDialog = true}>
              書き出し
            </button>
            <button @click=${e => {
        if (confirm("入力されているタスクを全て削除します。本当によろしいですか？")) {
          this.tasks = [];
        }
      }}>
              クリア
            </button>
          </div>
        </div>
        ${(this.openAddDialog ? () => this.addDialog() : () => "")()}
        ${(this.openCopyDialog ? () => this.copyDialog() : () => "")()}
      `;
  }
  updated() {
    this.renderRoot.querySelector("#inputName")?.focus();
  }
}
customElements.define("task-timer", TaskTimer);
document.body.append(new TaskTimer());