import './App.css';
import {useState} from 'react'
import axios from 'axios'

function App() {

  const[sText, setsText ] = useState('')

  
  const[sOutput, setsOutput ] = useState('')
  
  
  
  
  
  const[cScore, setcScore ] = useState('')


  const handleSubmit = async(e)=>{
    e.preventDefault()
    console.log(sText)
    try {
      const response = await axios.get(`http://localhost:5000/${sText}`)
      
      console.log(response.data)

      
      setsOutput(response.data.sentiment)
      
      setcScore(response.data.score)
      
      console.log(sOutput, cScore)

    } 
    
    catch (err) {
      
      console.log(err)
    
    }
  }

  return (
    
    <div className="App">
    
      <div className='form-div' >
    
        <label><h2>Enter the Text that You want to make the analysis on</h2></label>
    
        <textarea type='text' className="custom-textarea" onChange={e => setsText(e.target.value)} />
    
        <input type='submit' value="Submit" class="submit-button" onClick={handleSubmit}  />


      <div className='output-div'>

       <h2>Sentiment: {sOutput}</h2>

       <h2>Confidence Score: {cScore}</h2>
      </div>
    </div>
    </div>
  );
}

export default App;
