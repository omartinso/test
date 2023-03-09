import {useEffect, useState } from 'react'
import styles from "./Keyboard.module.css"

function App() {
   const [viewState, setViewState] = useState(0);
   const [gameOption, setGameOption] = useState<IGameOption>({character: {name:"Dave",bodyPartsCount:6}});
   const [gameHistory, setGameHistory] = useState<IGameHistory[]>([]);

   const onSaveHandler = (characterName: string) => {
    setGameOption({character:{name:characterName, bodyPartsCount:6}});
  };

  const onSaveGameHistory = (isWin: boolean) => {

    let gameNr = 1;
    if (gameHistory.length > 0) {
      var lastItem = gameHistory.slice(-1)[0];
      gameNr = (lastItem?.nr as number) + 1;
    }

    setGameHistory(gameHistory => [...gameHistory, {nr:gameNr, isWin: isWin, player: gameOption.character.name}]);
  }

  const onRowDown = (index: number) => {
    if ((index+1) !== gameHistory.length) {
      const nextList = [...gameHistory];
      var currentValue = gameHistory.slice(index)[0]
      var data = nextList.filter((_,i) => i !== index);

      const insertAt = index + 1;
      data = [
        // Items before the insertion point:
        ...data.slice(0, insertAt),
        // New item:
        { nr:currentValue.nr, player: currentValue.player, isWin: currentValue.isWin},
        // Items after the insertion point:
        ...data.slice(insertAt)
      ]

      setGameHistory(data);
   }
  }

  const onRowUp = (index: number) => {
    if (index !== 0) {
      const nextList = [...gameHistory];
      var currentValue = gameHistory.slice(index)[0]
      var data = nextList.filter((_,i) => i !== index);

      const insertAt = index - 1;
      data = [
        // Items before the insertion point:
        ...data.slice(0, insertAt),
        // New item:
        { nr:currentValue.nr, player: currentValue.player, isWin: currentValue.isWin},
        // Items after the insertion point:
        ...data.slice(insertAt)
      ]

      setGameHistory(data);
    }
  }



   let content;
   switch(viewState) {
    case 0:
      content = <InitialContent 
      startGame={()=> setViewState(1)}
      showResults={()=> setViewState(2)}
      gameOptions={()=> setViewState(3)}
      />
      break;
    case 1:
      content = <GameContent
        character={{ name: gameOption.character.name, bodyPartsCount: gameOption.character.bodyPartsCount }}
        exitGame={() => setViewState(0)}
        saveGameHistory={(isWin) => onSaveGameHistory(isWin)}
      />
      break;
    case 2:
      content = <ResultContent
      gameHistory={gameHistory}
      closeResult={() => setViewState(0)}
      deleteRow={index => {
        setGameHistory(gameHistory.filter((_,i) => i !== index));
      }}
      downRow={index => {onRowDown(index)}}
      upRow={index => {onRowUp(index)}}
      />
      break;
    case 3:
      content = <GameOptions
      options={gameOption}
      save={(name) => onSaveHandler(name)}
      close={() => setViewState(0)}
      />
      break;
   }

   return (
    <div style={{
        maxWidth:"800px", 
        display:"flex",
        flexDirection: "column",
        gap:"2rem",
        margin:"0 auto",
        alignItems: "center"}}>
        {content}
    </div>
   );
}



function InitialContent(props: {startGame: () => void, showResults: () => void, gameOptions: () => void }) {
  return (
    <div style={{ 
        display: "flex",
        flexDirection: "row",
        gap: "1.2rem"
      }}>
      <button onClick={props.gameOptions}>Game Options</button>
      <button onClick={props.startGame}>Start game</button>
      <button onClick={props.showResults}>Results</button>
    </div>   
  )
}

enum GameViewState{
  loading,
  loaded,
  losse,
  win
}

function GameContent(props: { character: IGameCharacter, exitGame: () => void, saveGameHistory: (isWin: boolean) => void}) {

  const [viewState, setViewState] = useState(GameViewState.loading);
  const [word, setWord] = useState<IWord>({
    letters: []
  });
  const [gameState, setGameState] = useState({
    guessCount: 0
  });

  

  const loadGame = async () => {
      window.setTimeout(async() => {

      var wordString = "testing";
      // try {
      //   const response = await fetch('https://localhost:7147/GetWord'); 
      //   wordString = await response.text();   
      // }
      // catch(e) {
      //   console.log("cannot get word");
      // }
      

      const word = {
        letters: []
      } as IWord;
      for (let i = 0; i < wordString.length; i++) {
        word.letters.push({
          value: wordString[i],
          state: 0
        });
      }
      setGameState({
        guessCount: 0
      })
      setWord(word);
      setViewState(GameViewState.loaded);
    });
  }

  useEffect(() => {
    loadGame();
  }, []);

  if(viewState === GameViewState.loading){
    return <h3>Loading...</h3>;
  }

  return (
    <>
      <GameCharacter count={gameState.guessCount} character={props.character} />
      <HangmanWord word={word} />
      <GameResult viewState={viewState}/>
      {
        (viewState !== GameViewState.losse && viewState !== GameViewState.win) &&
        <GameKeyboard
            guessLetter={(letter) => {
            const wordLetters = JSON.parse(JSON.stringify(word.letters)) as Array<IKeyboardLetter>; // [...word.letters];
            const foundLetters = wordLetters.filter(l => l.value.toLowerCase() === letter.toLowerCase());

            if(foundLetters.length === 0)
            {
              if(gameState.guessCount + 1 < props.character.bodyPartsCount){
                setGameState({
                  ...gameState,
                  guessCount: gameState.guessCount + 1
                });
              }
              else {
                setGameState({
                  ...gameState,
                  guessCount: gameState.guessCount + 1
                });
                
                wordLetters.filter(l=>l.state != 1).forEach(l => l.state = 2);           
                setWord({
                  letters: wordLetters
                });  
                setViewState(GameViewState.losse);
                props.saveGameHistory(false);
              }

              return 2;
            }
           
            foundLetters.forEach(l => l.state = 1);
            setWord({
              letters: wordLetters
            })

            if (wordLetters.every(l=>l.state === 1)) {
              setViewState(GameViewState.win);
              props.saveGameHistory(true);
            }
            
            return 1;
          }}
        />
      }
      <div style={{display:"flex", gap: "0.5rem"}}>
        <button onClick={loadGame}>New game</button>
        <button onClick={props.exitGame}>Exit</button>
      </div>
    </>   
  )
}

type IWord = {
  letters: Array<IKeyboardLetter> 
}

export function HangmanWord(props: { word: IWord }) {
  return (
      <div
        style={{
          display: "flex",
          gap: ".25em",
          fontSize: "6rem",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontFamily: "monospace",
        }}
      >
      
      {props.word.letters.map((letter, index) => (
      <span style={{ borderBottom: ".1em solid black" }} key={index}>
        <span
          style={{
            visibility: letter.state === 1 || letter.state === 2 ? "visible" : "hidden",
            color: letter.state === 2 ? "red" : "black",
          }}
        >
          {letter.value}
        </span>
      </span>
    ))}
      </div>
    )
}


type IGameCharacter = {
  name: string;
  bodyPartsCount: number;
}

type IGameOption = {
  character: IGameCharacter;
}

type IGameHistory = {
  nr: number;
  isWin: boolean;
  player: string;
}

const HEAD = (
  <div
    key={1}
    style={{
      width: "50px",
      height: "50px",
      borderRadius: "100%",
      border: "10px solid black",
      position: "absolute",
      top: "50px",
      right: "-30px",
    }}
  />
)

const BODY = (
  <div
    key={2}
    style={{
      width: "10px",
      height: "100px",
      background: "black",
      position: "absolute",
      top: "120px",
      right: 0,
    }}
  />
)

const RIGHT_ARM = (
  <div
    key={3}
    style={{
      width: "100px",
      height: "10px",
      background: "black",
      position: "absolute",
      top: "150px",
      right: "-100px",
      rotate: "-30deg",
      transformOrigin: "left bottom",
    }}
  />
)

const LEFT_ARM = (
  <div
    key={4}
    style={{
      width: "100px",
      height: "10px",
      background: "black",
      position: "absolute",
      top: "150px",
      right: "10px",
      rotate: "30deg",
      transformOrigin: "right bottom",
    }}
  />
)

const RIGHT_LEG = (
  <div
    key={5}
    style={{
      width: "100px",
      height: "10px",
      background: "black",
      position: "absolute",
      top: "210px",
      right: "-90px",
      rotate: "60deg",
      transformOrigin: "left bottom",
    }}
  />
)

const LEFT_LEG = (
  <div
    key={6}
    style={{
      width: "100px",
      height: "10px",
      background: "black",
      position: "absolute",
      top: "210px",
      right: 0,
      rotate: "-60deg",
      transformOrigin: "right bottom",
    }}
  />
)


const BODY_PARTS = [HEAD, BODY, RIGHT_ARM, LEFT_ARM, RIGHT_LEG, LEFT_LEG];

function GameCharacter (props: { character: IGameCharacter, count: number}) {
  return (
    <div style={{position:"relative"}}>
      {BODY_PARTS.slice(0, props.count)}
      <div style={{
          height:"50px",
          width:"10px", 
          background:"black", 
          position:"absolute",
          top: 0,
          right: 0
          }}
      >

      </div>
      <div style={{
          height:"10px",
          width:"200px", 
          background:"black", 
          marginLeft:"120px"
          }}
      ></div>
      <div style={{
          height:"400px",
          width:"10px", 
          background:"black", 
          marginLeft:"120px"
          }}
      >
      </div>
      <div style={{
          height:"10px",width:"250px", background:"black"}}>
      </div>
      <div>
        Name: {props.character.name} ({props.count}:{props.character.bodyPartsCount})
      </div>
    </div>
  );
}

type IKeyboardLetter = {
  value: string;
  state: number;
}

const KEYS = ["a","b","c","d","e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

export function GameKeyboard(props: { disabled?: boolean; guessLetter: (letter: string) => number; }) {

  const [letters, setLetters] = useState<Array<IKeyboardLetter>>(() => {
    return KEYS.map(char => {
      return {
        value: char,
        state: 0
      };
    })
  });

  useEffect(() => {
    if(!props.disabled) {
      const onKeyPress = (e: KeyboardEvent) => {
        const key = e.key
        if (!key.match(/^[a-z]$/)) return;
        e.preventDefault();
        guessLetter(letters.find(letter => letter.value.toLowerCase() === key.toLowerCase()));
      }
  
      document.addEventListener("keypress", onKeyPress);
      return () => {
        document.removeEventListener("keypress", onKeyPress);
      }
    }
  });

  const guessLetter = (letter: IKeyboardLetter | undefined) => {
    if(letter != undefined && letter.state === 0){
      const letterState = props.guessLetter(letter.value);
      const letterIndex = letters.findIndex((l => l.value === letter.value));
      const lettersCopy = [...letters];
      lettersCopy[letterIndex].state = letterState;
      setLetters(lettersCopy);
    }
  }

  return (
    <div style={{ alignSelf: "stretch" }}>
      <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))",
            gap: ".5rem",
          }}
        >       
        {letters.map(letter => {
          return (
            <button
              key={letter.value}
              onClick={() => guessLetter(letter) }
              className={`${styles.btn} ${letter.state === 1 ? styles.active : ""} ${letter.state === 2 ? styles.inactive : ""}`}
              disabled={props.disabled || letter.state !== 0}>
              {letter.value}
            </button>
          )
        })}  
        </div>
      </div>
    )    
}

function ResultContent(props: {
  closeResult: () => void, gameHistory: IGameHistory[], 
  deleteRow: (index: number) => void,
  downRow: (index: number) => void,
  upRow: (index: number) => void}) {
  return (
    <div>
      <table border={1}>
        <thead>
          <tr>
            <td style={{paddingRight:"10px", paddingLeft:"10px"}}>Game nr.</td>
            <td style={{paddingRight:"10px", paddingLeft:"10px"}}>Player</td>
            <td style={{paddingRight:"10px", paddingLeft:"10px"}}>Win</td>
            <td style={{paddingRight:"10px", paddingLeft:"10px"}}>Losse</td>
            <td style={{paddingRight:"10px", paddingLeft:"10px"}}>Action</td>
          </tr>
        </thead>
        <tbody>
          {props.gameHistory.map((data, index) => {
          return (
                <tr key={index}>
                  <td style={{textAlign:"center"}}>{data.nr}</td>
                  <td style={{textAlign:"center"}}>{data.player}</td>
                  <td style={{textAlign:"center"}}>{data.isWin && "X"}</td>
                  <td style={{textAlign:"center"}}>{!data.isWin && "X"}</td>
                  <td>
                    <button onClick={() => props.upRow(index)}>Up</button>
                    <button onClick={() => props.downRow(index)}>Down</button>
                    <button onClick={(e) => props.deleteRow(index)}>Delete</button>
                  </td>
                </tr>
          );
        })}    
      </tbody>
      </table>
      <div style={{textAlign:"right"}}>Records: {props.gameHistory.length}</div>
      <br></br>
      <button onClick={props.closeResult}>Close</button>
    </div>   
  )
}


function GameResult(props: {viewState: GameViewState}) {
  switch(props.viewState) {
    case GameViewState.losse:
      return <h1>You Losse!</h1>  
    case GameViewState.win:
      return <h1>You Win!</h1>  
    default:
      return null;  
  }
}


function GameOptions(props: {close: () => void, options: IGameOption, save: (name: string) => void}) {
  
  var [data, setData] = useState<string>(props.options.character.name);

  function onChangeValue(e: any)
  {
    setData(e.target.value);
  }

  return (
    <div>     
      Player name: <input onChange={(e) => onChangeValue(e)} defaultValue={data}/>
      <button style={{marginLeft:"10px"}} onClick={() => props.save(data)}>Save</button>
      <button style={{marginLeft:"10px"}} onClick={props.close}>Close</button>
    </div>   
  )
}

export default App
