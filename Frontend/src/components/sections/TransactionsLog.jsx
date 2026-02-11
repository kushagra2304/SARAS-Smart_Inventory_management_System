import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
const BASE_URL = import.meta.env.VITE_API_URL;

export default function ManageTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [itemCode, setItemCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [transactionType, setTransactionType] = useState("issued");

  const [itemFilter, setItemFilter] = useState("None");
  const [quantityFilter, setQuantityFilter] = useState("None");
  const [priceFilter, setPriceFilter] = useState("None");
  const [typeFilter, setTypeFilter] = useState("None");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setFetching(true);
    try {
      const response = await axios.get(`${BASE_URL}/inventory/transactions`, { withCredentials: true });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid data format");
      }

      setTransactions(
  response.data.map((txn) => ({
    id: txn.id,
    itemCode: txn.item_code || "Unknown",
    quantity: txn.quantity || "0",
    price: txn.price !== undefined ? parseFloat(txn.price).toFixed(2) : "0.00",
    type: txn.transaction_type || "N/A",
    date: new Date(txn.transaction_date).toLocaleDateString(),
    remaining: txn.remaining_after ?? "N/A",
    updatedBy: txn.updated_by || "System",
  }))
);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setFetching(false);
    }
  };

  const addTransaction = async () => {
    if (!itemCode.trim() || !quantity.trim() || !transactionType || !price.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const newTransaction = {
        item_code: itemCode.trim(),
        quantity: parseInt(quantity, 10),
        transaction_type: transactionType,
        price: parseFloat(price),
        
      };

      await axios.post(`${BASE_URL}/inventory/transaction`, newTransaction, { withCredentials: true });

      toast.success("Transaction added successfully");
      setItemCode("");
      setQuantity("");
      setPrice("");
      setTransactionType("issued");
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  const filteredTransactions = transactions
    .filter((txn) => (itemFilter === "None" ? true : txn.itemCode === itemFilter))
    .filter((txn) => (typeFilter === "None" ? true : txn.type === typeFilter));

  let sortedTransactions = [...filteredTransactions];
  if (quantityFilter === "High") sortedTransactions.sort((a, b) => b.quantity - a.quantity);
  if (quantityFilter === "Low") sortedTransactions.sort((a, b) => a.quantity - b.quantity);
  if (priceFilter === "High") sortedTransactions.sort((a, b) => b.price - a.price);
  if (priceFilter === "Low") sortedTransactions.sort((a, b) => a.price - b.price);

  const uniqueItemCodes = [...new Set(transactions.map((t) => t.itemCode))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Transaction Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4 flex-wrap">
          <Input placeholder="Item Code" value={itemCode} onChange={(e) => setItemCode(e.target.value)} />
          <Input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min="1" />
          <Input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.01" />
          <Select value={transactionType} onValueChange={(value) => setTransactionType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start" avoidCollisions={false}>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="received">Received</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addTransaction}>Add Transaction</Button>
        </div>

        {fetching && <p className="text-center text-gray-500">Loading transactions...</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>

                <div className="flex items-center gap-2">
                  Item Code
                  <Select onValueChange={setItemFilter}>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" avoidCollisions={false}>
                      <SelectItem value="None">None</SelectItem>
                      {uniqueItemCodes.map((code) => (
                        <SelectItem key={code} value={code}>{code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Used
                  <Select onValueChange={setQuantityFilter}>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" avoidCollisions={false}>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="High">High to Low</SelectItem>
                      <SelectItem value="Low">Low to High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Price
                  <Select onValueChange={setPriceFilter}>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" avoidCollisions={false}>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="High">High to Low</SelectItem>
                      <SelectItem value="Low">Low to High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Type
                  <Select onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" avoidCollisions={false}>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
             
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>{txn.date}</TableCell>
                  <TableCell>{txn.itemCode}</TableCell>
                  <TableCell>{txn.remaining}</TableCell>
                  <TableCell>{txn.quantity}</TableCell>
                  <TableCell>Rs.{txn.price}</TableCell>
                  <TableCell className={txn.type === "issued" ? "text-red-500" : "text-green-500"}>{txn.type}</TableCell>
                  
                  
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="6" className="text-center text-gray-500">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
