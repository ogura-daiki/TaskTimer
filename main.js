
import { LitElement, html, css, live, repeat } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

import LocalStorageStore from 'https://ogura-daiki.github.io/store/LocalStorageStore.js';
import Models from "./Migrations/index.js";
import { newTask } from "./Model/Task.js";
import { newTemplate } from "./Model/Template.js";
import iconFonts from "./libs/iconFonts.js";

const store = new LocalStorageStore(Models);

class TaskTimer extends LitElement {
  static get properties() {
    return {
      tasks: { type: Array },
      templates: { type: Array },
      openAddDialog: { state: true },
      openCopyDialog: { state: true },
      openTemplateDialog: { state: true },
    }
  }
  static get styles() {
    return [
      iconFonts,
      css`
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
      `
    ];
  }
  constructor() {
    super();

    this.tasks = store.get("Tasks");
    this.templates = store.get("Templates");
    this.openAddDialog = false;
    this.openCopyDialog = false;
    this.openTemplateDialog = false;
  }
  #saveTasks(){
    store.set("Tasks", this.tasks);
  }
  #saveTemplates(){
    store.set("Templates", this.templates);
  }
  insertTask(idx, task){
    this.tasks.splice(idx, 0, task);
  }
  addTask() {
    if (!this.inputName) return;
    this.openAddDialog = false;
    this.tasks.forEach(task => {
      if (!task.isCompleted()) task.complete();
    });
    this.insertTask(this.insertTo, newTask(this.inputName, this.inputMemo));
    this.#saveTasks();
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
                .value=${this.inputName??""}
                @input=${e => {
                  this.inputName = e.target.value
                }}
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
                .value=${this.inputMemo??""}
                @input=${e => {
                  this.inputMemo = e.target.value;
                }}
                @keydown=${e => { if (e.key === "Enter" && e.ctrlKey) this.addTask(); }}
              ></textarea>
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
                return `${task.getTimeStr("from")}～${task.getTimeStr("to")??task._dt2TimeStr(new Date())} ${task.name}${task.memo ? `\n${task.memo.split("\n").map(s => "  " + s).join("\n")}` : ""}`;
              }).reverse().join("\n")
            }</textarea>
          </div>
        </div>
      </div>
    `;
  }
  templateDialog() {
    const input = {
      label:"",
      name:"",
      memo:"",
    }
    return html`
      <div class="backdrop centering">
        <div class="dialog col gap-0">
          <div class="row bar">
            <div class="title grow">
              テンプレート追加
            </div>
            <button @click=${e => this.openTemplateDialog = false}>×</button>
          </div>
          <div class="col grow content" style="overflow-y:scroll">
            <input @input=${e=>input.label = e.target.value.trim()}></input>
            <input @input=${e=>input.name = e.target.value.trim()}></input>
            <textarea class="noresize grow" @input=${e=>input.memo = e.target.value}></textarea>
            <button @click=${e=>{
              if([input.label, input.name].some(v=>!v)){
                return;
              }
              const template = newTemplate(input.label, input.name, input.memo);
              this.templates.push(template);
              this.#saveTemplates();
              this.openTemplateDialog = false;
              this.requestUpdate();
            }}>追加</button>
          </div>
        </div>
      </div>
    `;
  }
  timeInput(task, name) {
    return html`
    <input
      type="time" value="${task.getTimeStr(name)}"
      @input=${e => {
        task.setTimeStr(name, e.target.value);
        this.#saveTasks();
      }}
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
            this.#saveTasks();
          }} style="font-size:1.2em"
        >
        <textarea 
          .value=${task.memo}
          @input=${e => {
            task.memo = e.target.value;
            this.#saveTasks();
          }}
        ></textarea>
        <div class="row">
          ${this.timeInput(task, "from")}
          <span>～</span>
          ${task.to ? this.timeInput(task, "to") : "実施中"}
        </div>
        
        <div class="row">
          <button
            ?disabled=${task.to}
            @click=${e => {
              task.complete();
              this.#saveTasks();
              this.requestUpdate();
            }}
          >
            完了
          </button>
          <button
            ?disabled=${!task.to}
            @click=${e => {
              if (confirm(`タスク名：${task.name} の完了を取り消しますか？`)) {
                task.cancelComplete();
                this.#saveTasks();
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
                this.#saveTasks();
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
          <div class="row grow">
          ${this.templates.map((template, idx)=>html`
            <button
              @click=${e => {
                this.insertTo = 0;
                this.inputName = template.name;
                this.inputMemo = template.memo;
                this.openAddDialog = true;
              }}
              @contextmenu=${e=>{
                e.preventDefault();
                if(confirm(`テンプレート：${template.label}を削除しますか？`)){
                  this.templates.splice(idx, 1);
                  this.requestUpdate();
                  this.#saveTemplates();
                }
              }}
            >${template.label}</button>
          `)}
          </div>
          <button @click=${e => this.openTemplateDialog = true}>テンプレート追加</button>
          <button @click=${e => this.openCopyDialog = true}>
            書き出し
          </button>
          <button @click=${e => {
            if (confirm("入力されているタスクを全て削除します。本当によろしいですか？")) {
              this.tasks = [];
              this.#saveTasks();
            }
          }}>
            クリア
          </button>
        </div>
      </div>
      ${(this.openAddDialog ? () => this.addDialog() : () => "")()}
      ${(this.openCopyDialog ? () => this.copyDialog() : () => "")()}
      ${(this.openTemplateDialog ? () => this.templateDialog() : () => "")()}
    `;
  }
  updated() {
    this.renderRoot.querySelector("#inputName")?.focus();
  }
}
customElements.define("task-timer", TaskTimer);
document.body.append(new TaskTimer());