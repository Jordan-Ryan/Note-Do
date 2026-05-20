import { useMemo, useState } from 'react';
import styled from 'styled-components';

type PanelTab = 'Overview' | 'Variants' | 'Inventory' | 'Suppliers' | 'Media' | 'History';
type DetailTab = 'Variants' | 'Attributes' | 'Inventory' | 'Suppliers' | 'Media' | 'History' | 'Change log';

interface Product {
  id: string;
  name: string;
  code: string;
  brand: string;
  area: string;
  category: string;
  rrp: string;
  status: 'LIVE' | 'PENDING' | 'DRAFT';
  stock: number;
  updated: string;
}

const products: Product[] = [
  { id: '45075832', name: 'ASOS DESIGN cropped blazer in black', code: '45075832', brand: 'ASOS DESIGN', area: 'Womenswear', category: 'Tailoring', rrp: '£45.00', status: 'LIVE', stock: 120, updated: '21 May 2024' },
  { id: '27123456', name: 'Nike Air Force 1 ’07 trainers in white', code: '27123456', brand: 'Nike', area: 'Menswear', category: 'Footwear', rrp: '£110.00', status: 'LIVE', stock: 58, updated: '21 May 2024' },
  { id: '62789123', name: 'New Look tiered smock dress in cream floral', code: '62789123', brand: 'New Look', area: 'Womenswear', category: 'Dresses', rrp: '£28.99', status: 'PENDING', stock: 0, updated: '20 May 2024' },
  { id: '57689102', name: 'Topshop straight leg jean in mid blue', code: '57689102', brand: 'Topshop', area: 'Womenswear', category: 'Denim', rrp: '£40.00', status: 'LIVE', stock: 210, updated: '20 May 2024' },
];

const variants = [4, 6, 8, 10, 12].map((size, i) => ({ size, sku: `45075832-${size}`, ean: `50596712345${67 + i}`, stock: [12, 18, 20, 22, 20][i], available: [10, 15, 16, 18, 17][i] }));

export default function TodoPage() {
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [expanded, setExpanded] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>('Overview');
  const [detailTab, setDetailTab] = useState<DetailTab>('Variants');
  const selected = useMemo(() => products.find((p) => p.id === selectedProductId) ?? products[0], [selectedProductId]);

  return (
    <Page>
      {!expanded && (
        <SplitLayout>
          <Catalogue>
            <h1>Products</h1>
            <p>View and manage all products across all areas and brands.</p>
            <Table>
              <thead><tr><th>Product name</th><th>Code</th><th>Brand</th><th>Category</th><th>RRP</th><th>Status</th><th>Stock</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} onClick={() => setSelectedProductId(p.id)} data-active={p.id === selectedProductId}>
                    <td>{p.name}</td><td>{p.code}</td><td>{p.brand}</td><td>{p.category}</td><td>{p.rrp}</td><td><Badge>{p.status}</Badge></td><td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Catalogue>
          <SidePanel>
            <button onClick={() => setExpanded(true)}>Expand full details ↗</button>
            <h2>{selected.name}</h2>
            <Small>Product code {selected.code}</Small>
            <TabRow>{(['Overview', 'Variants', 'Inventory', 'Suppliers', 'Media', 'History'] as PanelTab[]).map((t) => <Tab key={t} data-active={panelTab===t} onClick={() => setPanelTab(t)}>{t}</Tab>)}</TabRow>
            <Card>{panelTab} content (prototype dummy data)</Card>
          </SidePanel>
        </SplitLayout>
      )}
      {expanded && (
        <FullView>
          <Top><button onClick={() => setExpanded(false)}>← Back to catalogue split view</button><h1>{selected.name}</h1></Top>
          <Grid>
            <Card><h3>Media</h3><p>7 assets</p><MediaGrid>{Array.from({ length: 6 }).map((_, i) => <Asset key={i}>{i === 5 ? '+2' : 'IMG'}</Asset>)}</MediaGrid></Card>
            <Card><h3>Product summary</h3><p>Brand: {selected.brand}</p><p>Category: Tailoring › Blazers</p><p>Season: AW24</p><p>Country: China</p></Card>
            <Card><h3>Commercials</h3><p>RRP: £45.00</p><p>Cost price: £18.00</p><p>Margin: 60.0%</p></Card>
          </Grid>
          <Card>
            <TabRow>{(['Variants', 'Attributes', 'Inventory', 'Suppliers', 'Media', 'History', 'Change log'] as DetailTab[]).map((t) => <Tab key={t} data-active={detailTab===t} onClick={() => setDetailTab(t)}>{t}</Tab>)}</TabRow>
            {detailTab === 'Variants' ? (
              <Table><thead><tr><th>Size</th><th>Colour</th><th>SKU</th><th>EAN</th><th>Status</th><th>Stock</th><th>Available</th><th>RRP</th></tr></thead><tbody>{variants.map((v)=><tr key={v.sku}><td>{v.size}</td><td>Black</td><td>{v.sku}</td><td>{v.ean}</td><td><Badge>LIVE</Badge></td><td>{v.stock}</td><td>{v.available}</td><td>£45.00</td></tr>)}</tbody></Table>
            ) : <Card>{detailTab} tab content (dummy data)</Card>}
          </Card>
        </FullView>
      )}
    </Page>
  );
}

const Page = styled.div`padding: 24px; overflow:auto; height:100%;`;
const SplitLayout = styled.div`display:grid; grid-template-columns: 1fr 380px; gap:16px;`;
const Catalogue = styled.section`background:#fff; border:1px solid #e7e7e7; border-radius:14px; padding:16px;`;
const SidePanel = styled.aside`background:#fff; border:1px solid #e7e7e7; border-radius:14px; padding:16px; display:grid; gap:12px; align-content:start;`;
const FullView = styled.div`display:grid; gap:16px;`;
const Top = styled.div`display:grid; gap:8px;`;
const Grid = styled.div`display:grid; grid-template-columns: 2fr 1fr 1fr; gap:12px;`;
const Card = styled.section`background:#fff; border:1px solid #e7e7e7; border-radius:14px; padding:14px;`;
const Table = styled.table`
  width:100%; border-collapse: collapse; font-size:14px;
  th,td{border-bottom:1px solid #efefef; padding:10px; text-align:left;}
  tbody tr[data-active='true']{background:#f4f7ff;}
  tbody tr{cursor:pointer;}
`;
const Badge = styled.span`background:#dff3e2; color:#2d7e3c; border-radius:999px; padding:2px 8px; font-size:12px; font-weight:700;`;
const TabRow = styled.div`display:flex; gap:8px; flex-wrap:wrap;`;
const Tab = styled.button`
  border:1px solid #ddd; background:#fff; padding:6px 10px; border-radius:999px; cursor:pointer;
  &[data-active='true']{background:#111; color:#fff; border-color:#111;}
`;
const Small = styled.p`margin:0; color:#666;`;
const MediaGrid = styled.div`display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;`;
const Asset = styled.div`height:90px; border-radius:8px; background:#ececec; display:grid; place-items:center; font-weight:700;`;
