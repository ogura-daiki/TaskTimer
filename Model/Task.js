import { createId, setProto } from "../libs/ModelUtil.js";

const proto = {
  _dt2TimeStr(dt){
    const pad0 = num => (""+num).padStart(2,"0");
    return `${pad0(dt.getHours())}:${pad0(dt.getMinutes())}`;
  },  
  getTimeStr(name) {
    if(!this[name]) return;
    const dateTime = this[name];
    return this._dt2TimeStr(dateTime);
  },
  setTimeStr(name, value){
    if(!this[name]) return;
    const [hours, minutes] = value.split(":").map(v=>+v);
    const dateTime = this[name];
    dateTime.setHours(hours);
    dateTime.setMinutes(minutes);
  },
};

const newTask = (name, memo="") => {
  return setProto({
    id: createId(),
    type:"task",
    name,
    memo,
    from:new Date(),
    to:undefined,
  }, proto);
};

const copyTask = (task) => {
  const newTask = newTask(task.name, task.memo);
  return Object.assign(newTask, {from:task.from, to:task.to});
}

export {
  proto,
  newTask,
  copyTask,
}