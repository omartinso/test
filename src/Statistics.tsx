import {IScore, IScoreTable} from "./Types"

export function Statistics(score: IScore) {
  return (
    <div style={{fontSize: "2em", textAlign: "center"}}>
     Wins: {score.wins} Losses: {score.losses}   
    </div>   
  )
}

export function GameHistoryTable(props: { scoreTable: IScoreTable[], deleteRow: (index: number) => void}) {

  return (
    <div style={{fontSize: "2em", textAlign: "center"}}>
    <h4>Game History</h4>
    <table border={1}>
        <thead>
          <tr>
            <td style={{paddingRight:"10px", paddingLeft:"10px"}}>Game nr.</td>
            <td style={{paddingRight:"10px", paddingLeft:"10px"}}>Win</td>
            <td style={{paddingRight:"10px", paddingLeft:"10px"}}>Losse</td>
            <td style={{paddingRight:"10px", paddingLeft:"10px"}}>Action</td>
          </tr>
        </thead>
        <tbody>
              
     {props.scoreTable.map((data, index) => {
        return (
              <tr key={index}>
                <td>{data.gameNr}</td>
                <td>{data.isWin && "X"}</td>
                <td>{!data.isWin && "X"}</td>
                <td><button onClick={(e) => props.deleteRow(index)}>Delete</button></td>
              </tr>
        );
      })}
      </tbody>
      </table>
    </div>   
  )
}