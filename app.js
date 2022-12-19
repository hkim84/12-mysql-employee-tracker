const figlet = require('figlet');
const db = require("./db");
const inquirer = require("inquirer");
require("console.table");


// Display logo
figlet('Employee Manager', function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data)
});

const exit = () => {
    console.log("Bye!");
    process.exit(0);
  };
const MainMenuPrompts = async () => {
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: [
          { name: "View all departments", value: viewDepartments },
          { name: "View all roles", value: viewRoles },
          { name: "View all employees", value: viewEmployees },
          { name: "Add a department", value: addDepartment },
          { name: "Add a role", value: addRole },
          { name: "Add an employee", value: addEmployee },
          { name: "Update an employee role", value: updateEmployeeRole },
          { name: "Update employee manager", value: updateEmployeeManager },
          { name: "View employees by manager", value: viewByManager },
          { name: "View employees by department", value: viewByDepartment },
          { name: "Delete a department", value: deleteDepartment },
          { name: "Delete a role", value: deleteRole },
          { name: "Delete an employee", value: deleteEmployee },
          { name: "View total utilized budget by department", value: budgetByDepartment},
          { name: "Exit", value: exit },
        ],
      },
    ]);
  
    answer.menu();


function viewDepartments() {
    db.findAllDepartments().then(([rows]) => {
      console.table(rows);
      return MainMenuPrompts();
    });
  }
  
  function viewEmployees() {
    db.findAllEmployees().then(([rows]) => {
      console.table(rows);
      return MainMenuPrompts();
    });
  }
  
  function viewRoles() {
    db.findAllRoles().then(([rows]) => {
      console.table(rows);
      return MainMenuPrompts();
    });
  }
  
  function validateInput(value) {
    if (value) {
      return true;
    } else {
      console.log("\n Please enter a value");
      return false;
    }
  }
  
  const addDepartment = async () => {
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the department name?",
        validate: validateInput,
      },
    ]);
 
    const departmentName = answer.name;
    db.addADepartment(departmentName).then(() => {
      db.findAllDepartments().then(([rows]) => {
        console.table(rows);
        return MainMenuPrompts();
      });
    });
  };
  
  const addRole = async () => {
  
    const [rows] = await db.findAllDepartments();
    console.table(rows);
    const departmentChoices = rows.map(({ name, id }) => ({ name, value: id }));
  
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the role title?",
        validate: validateInput,
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary for this role?",
        validate: validateInput,
      },
      {
        type: "list",
        name: "department",
        message: "Which department does this role belong to?",
        choices: departmentChoices,
      },
    ]);
  
  
    db.addARole(answer.name, answer.salary, answer.department).then(() => {
      db.findAllRoles().then(([rows]) => {
        console.table(rows);
        return MainMenuPrompts();
      });
    });
  };
  
  function mapEmployeeChoices({ id, name }) {
    return { name, value: id };
  }
  
  const addEmployee = async () => {
    const [rowsA] = await db.findAllRoles();
    console.table(rowsA);
    const roleChoices = rowsA.map(({ id, title }) => ({
      name: title,
      value: id,
    }));
    console.log(roleChoices);
  
    const [rowsB] = await db.findAllEmployees();
    const employeeChoices = rowsB.map(mapEmployeeChoices);
    console.log(employeeChoices);
  
    const managerChoices = [...employeeChoices, { name: "Null" }];
    console.log(managerChoices);
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
        validate: validateInput,
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
        validate: validateInput,
      },
      {
        type: "list",
        name: "role_id",
        message: "What is this employee's role?",
        choices: roleChoices,
      },
      {
        type: "confirm",
        name: "managerOrNot",
        message: "Does this employee have a manager?",
        default: true,
      },
      {
        type: "list",
        name: "manager_id",
        when: function (answers) {
          return answers.managerOrNot === true;
        },
        message: "Who is this employee's manager?",
        choices: managerChoices,
      },
    ]);
    delete answer.managerOrNot;
    console.log(answer);
    db.addAnEmployee(answer).then(() => {
      db.findAllEmployees().then(([rows]) => {
        console.table(rows);
        return MainMenuPrompts();
      });
    });
  };
  
  const updateEmployeeRole = async () => {
    const [rowsA] = await db.findAllRoles();
    console.table(rowsA);
    const roleChoices = rowsA.map(({ id, title }) => ({
      name: title,
      value: id,
    }));
    console.log(roleChoices);
  
    const [rowsB] = await db.findAllEmployees();
    const employeeChoices = rowsB.map(mapEmployeeChoices);
    console.log(employeeChoices);
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "employee",
        message: "Which employee's role do you want to update?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "role",
        message: "What is this employee's new role?",
        choices: roleChoices,
      },
    ]);
    console.log(answer);
    db.updateAnEmployeeRole(answer.role, answer.employee).then(() => {
      db.findAllEmployees().then(([rows]) => {
        console.table(rows);
        return MainMenuPrompts();
      });
    });
  };
  
  const updateEmployeeManager = async () => {
    const [rowsB] = await db.findAllEmployees();
    const employeeChoices = rowsB.map(mapEmployeeChoices);
    console.log(employeeChoices);
    const { employee } = await inquirer.prompt([
      {
        type: "list",
        name: "employee",
        message: "Which employee's manager do you want to update?",
        choices: employeeChoices,
      },
    ])
    const [managerRows] = await db.findAllManagers(employee);
    console.table(managerRows);
    const managerChoices = managerRows.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));
 
    managerChoices.push({ name: "No manager selected", value: null });
    const { manager } = await inquirer.prompt([
      {
        type: "list",
        name: "manager",
        message: "Who is this employee's new manager?",
        choices: managerChoices,
      },
    ]);
    db.updateAnEmployeeManager(manager, employee).then(() => {
      db.findAllEmployees().then(([rows]) => {
        console.table(rows);
        return MainMenuPrompts();
      });
    });
  };
  
  const viewByManager = async () => {
    const [allEmployees] = await db.findAllEmployees();
    const managerChoices = allEmployees.map(mapEmployeeChoices);
    const { manager } = await inquirer.prompt([
      {
        type: "list",
        name: "manager",
        message: "Which manager's employees do you want to see?",
        choices: managerChoices,
      },
    ]);
    const [managersEmployees] = await db.findByManager(manager);
    console.table(managersEmployees);
    return MainMenuPrompts();
  };
  
  const viewByDepartment = async () => {
    const [allDepartments] = await db.findAllDepartments();
    console.table(allDepartments);
    const departmentChoices = allDepartments.map(({ id, name }) => ({
      name: name,
      value: id,
    }));
    const { department } = await inquirer.prompt([
      {
        type: "list",
        name: "department",
        message: "Which department's employees do you want to see?",
        choices: departmentChoices,
      },
    ]);
    const [departmentEmployees] = await db.findByDepartment(department);
    console.table(departmentEmployees);
    return MainMenuPrompts();
  };
  
  const deleteDepartment = async () => {
    const [allDepartments] = await db.findAllDepartments();
    console.table(allDepartments);
    const departmentChoices = allDepartments.map(({ id, name }) => ({
      name: name,
      value: id,
    }));
    console.table(departmentChoices);
    const { department } = await inquirer.prompt([
      {
        type: "list",
        name: "department",
        message: "Which department do you want to delete?",
        choices: departmentChoices,
      },
    ]);
  
    db.deleteADepartment(department).then(() => {
      db.findAllDepartments().then(([rows]) => {
        console.table(rows);
        return MainMenuPrompts();
      });
    });
  };
  
  const deleteRole = async () => {
    const [rowsA] = await db.findAllRoles();
    console.table(rowsA);
    const roleChoices = rowsA.map(({ id, title }) => ({
      name: title,
      value: id,
    }));
    console.log(roleChoices);
    const response = await inquirer
      .prompt([
        {
          type: "list",
          name: "role",
          message: "Which role do you want to delete?",
          choices: roleChoices,
        },
      ])
      .then((response) => {
        db.deleteARole(response.role);
          db.findAllRoles().then(([rows]) => {
              console.table(rows);
              return MainMenuPrompts();
          });
      });
  };
  
  const deleteEmployee = async () => {
    const [rowsA] = await db.findAllEmployees();
    console.table(rowsA);
    const employeeChoices = rowsA.map(({ id, name }) => ({ name,
      value: id,
    }));
    console.table(employeeChoices);
    const response = await inquirer.prompt([
      {
        type: "list",
        name: "employee",
        message: "Which employee do you want to delete?",
        choices: employeeChoices,
      },
    ])
    .then((response) => {
      db.deleteAnEmployee(response.employee);
        db.findAllEmployees().then(([rows]) => {
            console.table(rows);
            return MainMenuPrompts();
        });
    });
  };
  
  const budgetByDepartment = async () => {
  
    const [departmentBudget] = await db.findDepartmentBudget();
    console.table(departmentBudget);
    return MainMenuPrompts();
  }
  
  MainMenuPrompts();
};