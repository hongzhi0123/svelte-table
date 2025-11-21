<!-- Main.svelte -->
<script>
  import MultiSelectTable from '$lib/components/MultiSelectTable.svelte';
  
  // Sample data - in a real app, this might come from an API or store
  let sampleData = $state([
    { id: 1, name: 'Alice Johnson', department: 'Engineering', status: 'Active' },
    { id: 2, name: 'Bob Smith', department: 'Marketing', status: 'Active' },
    { id: 3, name: 'Charlie Brown', department: 'Engineering', status: 'On Leave' },
    { id: 4, name: 'Diana Prince', department: 'Sales', status: 'Active' },
    { id: 5, name: 'Eve Wilson', department: 'Marketing', status: 'Inactive' },
    { id: 6, name: 'Frank Miller', department: 'HR', status: 'Active' },
    { id: 7, name: 'Grace Lee', department: 'Engineering', status: 'Active' },
    { id: 8, name: 'Henry Davis', department: 'Sales', status: 'On Leave' },
    { id: 9, name: 'Ivy Chen', department: 'Marketing', status: 'Active' },
    { id: 10, name: 'Jack Taylor', department: 'Engineering', status: 'Active' }
  ]);

  // Function to add more data (for demonstration)
  function addNewEmployee() {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
    const statuses = ['Active', 'On Leave', 'Inactive'];
    
    const newEmployee = {
      id: sampleData.length + 1,
      name: `New Employee ${sampleData.length + 1}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
    
    sampleData = [...sampleData, newEmployee];
  }

  // Function to reset data
  function resetData() {
    sampleData = [
      { id: 1, name: 'Alice Johnson', department: 'Engineering', status: 'Active' },
      { id: 2, name: 'Bob Smith', department: 'Marketing', status: 'Active' },
      { id: 3, name: 'Charlie Brown', department: 'Engineering', status: 'On Leave' },
      { id: 4, name: 'Diana Prince', department: 'Sales', status: 'Active' },
      { id: 5, name: 'Eve Wilson', department: 'Marketing', status: 'Inactive' },
    ];
  }
</script>

<main>
  <div class="container">
    <header>
      <h1>Employee Directory</h1>
      <p>Use the dropdown filters in the table headers to filter the data (Excel-style multi-select)</p>
    </header>

    <div class="controls">
      <button onclick={addNewEmployee} class="btn btn-primary">
        Add Random Employee
      </button>
      <button onclick={resetData} class="btn btn-secondary">
        Reset Data
      </button>
      <span class="record-count">
        Total Records: {sampleData.length}
      </span>
    </div>

    <div class="table-container">
      <MultiSelectTable data={sampleData} />
    </div>

    <div class="features">
      <h2>Features:</h2>
      <ul>
        <li>Multi-select dropdown filters in table headers</li>
        <li>Search within dropdowns</li>
        <li>Real-time filtering</li>
        <li>Excel-style filtering experience</li>
        <li>Responsive design</li>
      </ul>
    </div>
  </div>
</main>

<style>
  main {
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f5f5f5;
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  header {
    text-align: center;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;
  }

  h1 {
    color: #333;
    margin: 0 0 8px 0;
    font-size: 2rem;
  }

  header p {
    color: #666;
    margin: 0;
    font-size: 1.1rem;
  }

  .controls {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .btn {
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .btn-primary {
    background-color: #007acc;
    color: white;
  }

  .btn-primary:hover {
    background-color: #005a9e;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #545b62;
  }

  .record-count {
    margin-left: auto;
    font-weight: 500;
    color: #495057;
  }

  .table-container {
    margin-bottom: 32px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
  }

  .features {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
  }

  .features h2 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 1.3rem;
  }

  .features ul {
    margin: 0;
    padding-left: 20px;
    color: #555;
  }

  .features li {
    margin-bottom: 8px;
    line-height: 1.4;
  }
</style>