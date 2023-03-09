import { useCallback, useEffect, useState } from 'react'
import words from "./wordList.json"
import {HangmanDrawing} from "./HangmanDrawing"
import {HangmanWord} from "./HangmanWord"
import {Keyboard} from "./Keyboard"
import {Statistics, GameHistoryTable} from "./Statistics"
import {IScore, IScoreTable} from "./Types"


function App() {

   function getWord2() {  
     return words[Math.floor(Math.random() * words.length)]
   };

  const [score, setScore] = useState<IScore>({ wins: 0, losses: 0, gameNr: 1 });
  const [scoreTable, setScoreTable] = useState<IScoreTable[]>([]);

  const [wordToGuess, setWordToGuess] = useState("aaa");
 
  async function getWord() {
    const response = await fetch('https://localhost:7147/GetWord',
    {
    	method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();

    return setWordToGuess(responseData);
  };

  const [guessedLetters, setGuessedLetters] = useState<string[]>([])

  const incorrectLetters = guessedLetters.filter(
    letter => !wordToGuess.includes(letter)
  )

  const isLoser = incorrectLetters.length >= 6
  const isWinner = wordToGuess
    .split("")
    .every(letter => guessedLetters.includes(letter))

  useEffect(() => {
    
    if(isWinner){
      setScore({...score, wins: score.wins + 1, gameNr: score.gameNr +1});
      setScoreTable(scoreTable => [...scoreTable, {gameNr:1,isWin: true}]);
    }

    if(isLoser){
      setScore({...score, losses: score.losses + 1, gameNr: score.gameNr +1});
      setScoreTable(scoreTable => [...scoreTable, {gameNr:score.gameNr, isWin: false}]);
    }
  }, [isWinner, isLoser]);

  const addGuessedLetter = useCallback(
    (letter: string) => {
      if (guessedLetters.includes(letter) || isLoser || isWinner) return
      setGuessedLetters(currentLetters => [...currentLetters, letter])
    },
    [guessedLetters, isWinner, isLoser]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key
      if (!key.match(/^[a-z]$/)) return

      e.preventDefault()
      addGuessedLetter(key)
    }

    document.addEventListener("keypress", handler)

    return () => {
      document.removeEventListener("keypress", handler)
    }
  }, [guessedLetters])

  useEffect(() => {

    const handler = (e: KeyboardEvent) => {
      const key = e.key
      if (key !== "Enter") return

      e.preventDefault();
      setGuessedLetters([]);
      getWord();
      //setWordToGuess(getWord());     
    }

    document.addEventListener("keypress", handler)

    return () => {
      document.removeEventListener("keypress", handler)
    }
  }, []);

  return <div style={{
    maxWidth:"800px", 
    display:"flex",
    flexDirection: "column",
    gap:"2rem",
    margin:"0 auto",
    alignItems: "center"}}>

      <Statistics {...score} />   
      <div style={{fontSize: "2em", textAlign: "center"}}>
        {isWinner && "Winner! - Refresh to try again"}
        {isLoser && "Nice Try - Refresh to try again"}
      </div>

      <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
      <HangmanWord 
        reveal={isLoser}
        guessedLetters={guessedLetters}
        wordToGuess={wordToGuess} /> 
      <div style={{ alignSelf: "stretch" }}>
        <Keyboard
          disabled={isWinner || isLoser}
          activeLetters={guessedLetters.filter(letter =>
            wordToGuess.includes(letter)
          )}
          inactiveLetters={incorrectLetters}
          addGuessedLetter={addGuessedLetter}/>
        </div>
        <GameHistoryTable 
          scoreTable={scoreTable}
          deleteRow={index => {
              setScoreTable(scoreTable.filter((_,i) => i !== index));
        }} />   
    </div>
}


export default App
