import Papa from 'papaparse'

export const load = ({ fetch}) => {
    const fetchData = async () => {
        const res = await fetch('http://localhost:5173/ebi_ptm.json', {
        })
        const data = await res.json()
        return data
      }
  
    return {
      ebi_ptm: fetchData()
    }
  }

  