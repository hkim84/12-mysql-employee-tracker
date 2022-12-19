const connection = require("../config/connection");

// DB commands
class db {
  constructor(connection) {
    this.connection = connection;
  }

// finding all departmetns
  findAllDepartments() {
    return this.connection.promise().query("SELECT * FROM department");
  }

// finding by roles
  findAllRoles() {
    return this.connection
      .promise()
      .query(
        "SELECT roles.id, roles.title, roles.salary, department.name AS department FROM roles LEFT JOIN department ON roles.department_id = department.id"
      );
  }

// finding all employees
  findAllEmployees() {
    return this.connection.promise()
    .query(`SELECT
    employee.id, CONCAT(employee.first_name, ' ' , employee.last_name) AS name, roles.title, department.name AS department, roles.salary, CONCAT(manager.first_name, ' ' , manager.last_name) AS manager
    FROM
    employee LEFT JOIN roles ON employee.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id`);
}

// creating a new department
addADepartment(departmentName) {
    return this.connection
      .promise()
      .query("INSERT INTO department (name) VALUES (?)", [departmentName]);
  }

// creating a new role
  addARole(roleTitle, roleSalary, roleDepartmentId) {
    return this.connection
      .promise()
      .query(
        "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)",
        [roleTitle, roleSalary, roleDepartmentId]
      );
  }

// adding a new employee
  addAnEmployee(answer) {
    return this.connection
      .promise()
      .query("INSERT INTO employee SET ?", answer);
  }

// updating exsting employee role
  updateAnEmployeeRole(roleId, employeeId) {
    return this.connection
      .promise()
      .query("UPDATE employee SET role_id = ? WHERE id = ?", [
        roleId,
        employeeId,
      ]);
  }

// updating employee manager
  updateAnEmployeeManager(managerId, employeeId) {
    return this.connection
      .promise()
      .query("UPDATE employee SET employee.manager_id = ? WHERE id = ?", [managerId, employeeId]);
  }  

// finding alll manager
  findAllManagers(employeeId) {
      return this.connection.promise().query("SELECT * FROM employee WHERE id != ?", [employeeId]);
  }

// finding by manager
  findByManager(managerId) {
    return this.connection.promise().query(`SELECT employee.id, employee.manager_id, CONCAT(employee.first_name, ' ' , employee.last_name) AS name FROM employee LEFT JOIN roles on employee.role_id = roles.id WHERE manager_id = ?`, [managerId]);
  }

// finding by department
  findByDepartment(departmentId) {
      console.log("depId: ", departmentId)
    return this.connection.promise().query(`SELECT CONCAT(employee.first_name, ' ' , employee.last_name) AS name, department.name AS department
    FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id
    WHERE department.id = ?`, [departmentId]);
  }

//delete a department
  deleteADepartment(departmentId) {
    return this.connection.promise().query("DELETE FROM department WHERE id = ?", [departmentId]);
  }

// delete a role
  deleteARole(roleId) {
    console.log("roleId: ", roleId)
    return this.connection.promise().query("DELETE FROM roles WHERE id = ?", [roleId]); 
  }

// deleete a employee
  deleteAnEmployee(employeeId) {
    return this.connection.promise().query("DELETE FROM employee WHERE id = ?", [employeeId]);
  }

//find by department budget
  findDepartmentBudget() {
    return this.connection.promise().query("SELECT department.name AS department, department.id, SUM(salary) AS total_salary FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id GROUP BY department.id");
  }
}

module.exports = new db(connection);