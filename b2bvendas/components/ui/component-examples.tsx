/**
 * UI Components Usage Examples
 * 
 * This file demonstrates how to use all the reusable UI components.
 * Import these components from '@/components/ui' in your application.
 */

import React from 'react';
import {
  Button,
  Input,
  Label,
  Select,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableTableHead,
  TablePagination,
  DataTable,
  TableCheckbox,
} from '@/components/ui';

// ==================== BUTTON EXAMPLES ====================
export function ButtonExamples() {
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Button Examples</h2>
      
      {/* Variants */}
      <div className="flex flex-wrap gap-2">
        <Button variant="default">Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      {/* Sizes */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      {/* States */}
      <div className="flex flex-wrap gap-2">
        <Button disabled>Disabled</Button>
        <Button loading={loading} onClick={() => setLoading(!loading)}>
          {loading ? 'Loading...' : 'Click to Load'}
        </Button>
      </div>
    </div>
  );
}

// ==================== INPUT EXAMPLES ====================
export function InputExamples() {
  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-xl font-bold">Input Examples</h2>
      
      {/* Basic Input */}
      <Input placeholder="Enter text..." />
      
      {/* With Label */}
      <Input label="Email" type="email" placeholder="your@email.com" required />
      
      {/* With Error */}
      <Input 
        label="Password"
        type="password"
        error
        errorMessage="Password must be at least 8 characters"
        placeholder="Enter password"
      />
      
      {/* Different Types */}
      <Input type="number" label="Age" placeholder="Enter age" />
      <Input type="date" label="Birth Date" />
    </div>
  );
}

// ==================== SELECT EXAMPLES ====================
export function SelectExamples() {
  const [value, setValue] = React.useState('');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4 (Disabled)', disabled: true },
    { value: 'option5', label: 'Option 5' },
  ];

  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-xl font-bold">Select Examples</h2>
      
      {/* Basic Select */}
      <Select
        options={options}
        value={value}
        onValueChange={setValue}
        placeholder="Select an option..."
      />
      
      {/* With Label */}
      <Select
        options={options}
        label="Choose Option"
        required
        placeholder="Select..."
      />
      
      {/* With Error */}
      <Select
        options={options}
        label="Required Field"
        error
        errorMessage="This field is required"
        placeholder="Select..."
      />
    </div>
  );
}

// ==================== DIALOG EXAMPLES ====================
export function DialogExamples() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Dialog Examples</h2>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="primary">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input label="Confirmation" placeholder="Type 'DELETE' to confirm" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== CARD EXAMPLES ====================
export function CardExamples() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>This is a default card variant</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Card content goes here. You can add any content you want.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>This card has elevated styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Elevated cards have shadow effects on hover.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== BADGE EXAMPLES ====================
export function BadgeExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Badge Examples</h2>
      
      {/* Variants */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="default">Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="info">Info</Badge>
      </div>

      {/* Sizes */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge size="lg">Large</Badge>
      </div>
    </div>
  );
}

// ==================== TABLE EXAMPLES ====================
export function TableExamples() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc' | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);

  const data = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'inactive' },
  ];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(row => row.id)));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Table Examples</h2>
      
      {/* Basic Table */}
      <DataTable loading={loading} empty={data.length === 0}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <TableCheckbox
                  checked={selectedRows.size === data.length}
                  onChange={toggleAllRows}
                />
              </TableHead>
              <SortableTableHead
                sortable
                sortDirection={sortColumn === 'name' ? sortDirection : null}
                onSort={() => handleSort('name')}
              >
                Name
              </SortableTableHead>
              <SortableTableHead
                sortable
                sortDirection={sortColumn === 'email' ? sortDirection : null}
                onSort={() => handleSort('email')}
              >
                Email
              </SortableTableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} selected={selectedRows.has(row.id)}>
                <TableCell>
                  <TableCheckbox
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRowSelection(row.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>
                  <Badge variant={row.status === 'active' ? 'success' : 'error'} size="sm">
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={10}
        onPageChange={setCurrentPage}
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setLoading(!loading)}>
          Toggle Loading
        </Button>
        <Button size="sm" variant="outline">
          Selected: {selectedRows.size}
        </Button>
      </div>
    </div>
  );
}

// ==================== COMPLETE FORM EXAMPLE ====================
export function CompleteFormExample() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    role: '',
    status: '',
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>User Registration</CardTitle>
        <CardDescription>Create a new user account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Full Name"
          required
          placeholder="Enter full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        
        <Input
          label="Email"
          type="email"
          required
          placeholder="email@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        
        <Select
          label="Role"
          required
          options={[
            { value: 'admin', label: 'Administrator' },
            { value: 'user', label: 'User' },
            { value: 'guest', label: 'Guest' },
          ]}
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
          placeholder="Select role..."
        />
        
        <Select
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
          placeholder="Select status..."
        />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">Cancel</Button>
        <Button variant="primary" className="flex-1">Create User</Button>
      </CardFooter>
    </Card>
  );
}
