import { createId, setProto } from "../libs/ModelUtil.js";

const proto = {
  
};

const newTask = (name, memo="") => {
  return setProto({
    id: createId(),
    type:"task",
    name,
    memo,
    from:Date.now(),
    to:undefined,
  }, proto);
};

const copyTask = (task) => {
  const task = newTask(task.name, task.memo);
  return Object.assign(task, {from:task.from, to:task.to});
}

export {
  proto,
  newTask,
  copyTask,
}