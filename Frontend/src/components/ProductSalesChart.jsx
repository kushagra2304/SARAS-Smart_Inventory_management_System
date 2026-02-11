
import { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { TrendingUp } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const BASE_URL = import.meta.env.VITE_API_URL;
export default function ProductSalesChart() {
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState([])
  const [salesData, setSalesData] = useState([])
  const [current, setCurrent] = useState("")

  useEffect(() => {
    fetch(`${BASE_URL}/inventory/all-products`)
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (selected.length === 0) return
    fetch(`${BASE_URL}/inventory/sales-trend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: selected }),
    })
      .then(res => res.json())
      .then(setSalesData)
      .catch(console.error)
  }, [selected])

  const addProduct = () => {
    if (current && !selected.includes(current) && selected.length < 5) {
      setSelected([...selected, current])
      setCurrent("")
    }
  }

  const removeProduct = (code) => {
    setSelected(selected.filter(p => p !== code))
  }

  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Sales Trends</CardTitle>
          <CardDescription>Track last 3 months' sales by product</CardDescription>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto md:items-end">
          <Label>Select Product</Label>
          <div className="flex gap-2">
            <select
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="border px-2 py-1 rounded-md"
            >
              <option value="">Choose a product</option>
              {products.map((prod) => (
                <option key={prod.comp_code} value={prod.comp_code}>
                  {prod.description} ({prod.comp_code})
                </option>
              ))}
            </select>
            <Button onClick={addProduct} disabled={!current || selected.length >= 5}>
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {selected.map((code) => (
              <Badge
                key={code}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeProduct(code)}
              >
                {code} ×
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AreaChart width={700} height={300} data={salesData} margin={{ left: -20, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          {selected.map((product, index) => (
            <Area
              key={product}
              dataKey={product}
              type="monotone"
              fill={chartColors[index]}
              fillOpacity={0.3}
              stroke={chartColors[index]}
            />
          ))}
        </AreaChart>
      </CardContent>

      <CardFooter>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Showing last 3 months <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}
