let uniqueNumber;

let button = document.getElelementById("#btn-aceite")
button.addEventListener("click",gerarCodigo)

function gerarCodigo(){
    uniqueNumber = new Date().getTime();
    //console.log(uniqueNumber);

    const numeroBilhete= document.getElementById('id-bilhete');

    numeroBilhete.innerHTML = uniqueNumber;
    //window.location.href = "bilhete.html";


    let objBilhete = { codigo:uniqueNumber, data_geracao:"" };
          let url = 'http://localhost:3000/gerarbilhete'; //ex:/gerabilhete
  
          let res = axios.get(url, objBilhete) //O axios vai disponibilizar os dados do seu frontend para o backend. 
                                            //No backend vc pode acessar o objBilhete por meio de req.body.NomeDoAtributo//ex:codigo

          .then(response =>  { 
            mostraDados (response.data.resposta[0])
              if (response.data)  {
                const msg = new Comunicado (response.data.codigo, 
                                              response.data.mensagem, 
                                              response.data.descricao,
                                              response.data.resposta);
                                              
            }
          })
          .catch(error  =>  {
              
              if (error.response) {
                  const msg = new Comunicado (error.response.data.codigo, 
                                              error.response.data.mensagem, 
                                              error.response.data.descricao,
                                              error.response,data.resposta);
                  alert(msg.get());
                  console.log(error)
              }
          })
    return uniqueNumber;


}
