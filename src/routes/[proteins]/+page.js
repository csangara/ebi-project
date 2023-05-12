import Papa from 'papaparse'

export const load = ({ fetch, params }) => {
    const fetchData = async () => {
        const res = await fetch('http://localhost:5173/ebi_ptm.json', {
        })
        const data = await res.json()
        let protein_data = data.filter((d) => { return d.name == params.proteins})[0]
        return protein_data
      }
  
    return {
      protein: fetchData()
    }
  }

  