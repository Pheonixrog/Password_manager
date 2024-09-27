import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Layout, Row, Col, Button, Spin, List, Checkbox, Input } from "antd";

import React, { useEffect, useState } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";

import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Aptos } from "@aptos-labs/ts-sdk";

type Task = {
  address: string;
  completed: boolean;
  content: string;
  task_id: string;
};

export const aptos = new Aptos();
// change this to be your module account address
export const moduleAddress = "0x5448e45d5c73f4f44a91fe9bb11748e11e79153b4e4b658287c3f901d2ca4f78";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const { account, signAndSubmitTransaction } = useWallet();
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);

  const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewTask(value);
  };

  const fetchList = async () => {
    if (!account) return [];
    try {
      const todoListResource = await aptos.getAccountResource(
        {accountAddress:account?.address,
          resourceType:`${moduleAddress}::todolist::TodoList`}
      );
      setAccountHasList(true);
      // tasks table handle
      const tableHandle = (todoListResource as any).data.tasks.handle;
      // tasks table counter
      const taskCounter = (todoListResource as any).data.task_counter;

      let tasks = [];
      let counter = 1;
      while (counter <= taskCounter) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::todolist::Task`,
          key: `${counter}`,
        };
        const task = await aptos.getTableItem<Task>({handle:tableHandle, data:tableItem});
        tasks.push(task);
        counter++;
      }
      // set tasks in local state
      setTasks(tasks);
    } catch (e: any) {
      setAccountHasList(false);
    }
  };

  const addNewList = async () => {
    if (!account) return [];
    setTransactionInProgress(true);

    const transaction:InputTransactionData = {
      data:{
        function:`${moduleAddress}::todolist::create_list`,
        functionArguments:[]
      }
    }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
      setAccountHasList(true);
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const onTaskAdded = async () => {
    // check for connected account
    if (!account) return;
    setTransactionInProgress(true);

    const transaction:InputTransactionData = {
      data:{
        function:`${moduleAddress}::todolist::create_task`,
        functionArguments:[newTask]
      }
    }

    // hold the latest task.task_id from our local state
    const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].task_id) + 1 : 1;

    // build a newTaskToPush objct into our local state
    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
      task_id: latestId + "",
    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});

      // Create a new array based on current state:
      let newTasks = [...tasks];

      // Add item to the tasks array
      newTasks.push(newTaskToPush);
      // Set state
      setTasks(newTasks);
      // clear input text
      setNewTask("");
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const onCheckboxChange = async (event: CheckboxChangeEvent, taskId: string) => {
    if (!account) return;
    if (!event.target.checked) return;
    setTransactionInProgress(true);

    const transaction:InputTransactionData = {
      data:{
        function:`${moduleAddress}::todolist::complete_task`,
        functionArguments:[taskId]
      }
    }

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});

      setTasks((prevState) => {
        const newState = prevState.map((obj) => {
          // if task_id equals the checked taskId, update completed property
          if (obj.task_id === taskId) {
            return { ...obj, completed: true };
          }

          // otherwise return object as is
          return obj;
        });

        return newState;
      });
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Layout className="bg-transparent">
        <Row align="middle" className="py-4">
          <Col span={10} offset={2}>
            <h1 className="text-3xl font-bold">Decentralized Password Manager</h1>
          </Col>
          <Col span={12} className="text-right pr-8">
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <Spin spinning={transactionInProgress}>
        {!accountHasList ? (
          <Row gutter={[0, 32]} className="mt-8">
            <Col span={8} offset={8}>
              <Button
                disabled={!account}
                block
                onClick={addNewList}
                type="primary"
                className="h-12 bg-blue-600 hover:bg-blue-700 border-none text-lg font-semibold"
              >
                Add new Password
              </Button>
            </Col>
          </Row>
        ) : (
          <Row gutter={[0, 32]} className="mt-8">
            <Col span={8} offset={8}>
              <Input.Group compact>
                <Input
                  onChange={(event) => onWriteTask(event)}
                  className="w-4/5 h-12 bg-gray-800 border-gray-700 text-gray-100"
                  placeholder="Add new Password and its decription...."
                  size="large"
                  value={newTask}
                />
                <Button onClick={onTaskAdded} type="primary" className="w-1/5 h-12 bg-blue-600 hover:bg-blue-700 border-none">
                  Add
                </Button>
              </Input.Group>
            </Col>
            <Col span={8} offset={8}>
              {tasks && (
                <List
                  size="small"
                  bordered
                  dataSource={tasks}
                  className="bg-gray-800 border-gray-700"
                  renderItem={(task: Task) => (
                    <List.Item
                      actions={[
                        <div>
                          {task.completed ? (
                            <Checkbox defaultChecked={true} disabled />
                          ) : (
                            <Checkbox onChange={(event) => onCheckboxChange(event, task.task_id)} />
                          )}
                        </div>,
                      ]}
                      className="border-b border-gray-700 last:border-b-0"
                    >
                      <List.Item.Meta
                        title={<span className="text-gray-100">{task.content}</span>}
                        description={
                          <a
                            href={`https://explorer.aptoslabs.com/account/${task.address}/`}
                            target="_blank"
                            className="text-blue-400 hover:text-blue-300"
                          >{`${task.address.slice(0, 6)}...${task.address.slice(-5)}`}</a>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
}

export default App;