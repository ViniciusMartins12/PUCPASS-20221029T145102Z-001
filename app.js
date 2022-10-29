function BD ()
{
	process.env.ORA_SDTZ = 'UTC-3'; // garante horário de Brasília
	
	this.getConexao = async function ()
	{
		if (global.conexao)
			return global.conexao;

        const oracledb = require('oracledb');
        const dbConfig = require('./dbconfig.js');
        
        try
        {
		    global.conexao = await oracledb.getConnection( {
				user          : "SYSTEM",
				password      : "246645",
				connectString : "localhost:1521/XE"
			  });
		}
		catch (erro)
		{
			console.log ('Não foi possível estabelecer conexão com o BD!');
			process.exit(1);
		}

		return global.conexao;
	}

	this.estrutureSe = async function ()
	{
		try
		{
			const conexao = await this.getConexao();
			const sql     = 	'CREATE TABLE BILHETES(CODIGO INTEGER NOT NULL PRIMARY KEY, ' +
								'NUMERO_BILHETE VARCHAR2(32) DEFAULT (sys_guid()),' +
								'DATA_CRIACAO DATE DEFAULT SYSDATE NOT NULL)';
			const sql2	  =		'CREATE SEQUENCE SEQ_CODIGO_BILHETE INCREMENT BY 1 START WITH 1 MINVALUE 1 MAXVALUE 10000000';



			await conexao.execute(sql,sql2);
		}
		catch (erro)
		{} // se a já existe, ignora e toca em frente
	}
}

function Bilhetes (bd)
{
	this.bd = bd;
	
	this.inclua = async function (bilhete)
	{
		const conexao = await this.bd.getConexao();
		
		const sql1 = 'INSERT INTO BILHETES (CODIGO)'+
						'VALUES  (SEQ_CODIGO_BILHETE.nextval)';
		//const dados = [bilhete.codigo,bilhete.NUMERO_BILHETE]; caso fosse pegar algo do front para passar pro back
		console.log(sql1);	   //console.log(sql1, dados);
		await conexao.execute(sql1);  //await conexao.execute(sql1,dados);
		
		const retorno = await conexao.execute(sql1);

		const sql2 = 'COMMIT';
		await conexao.execute(sql2);	

		const result1 = await connection.execute(
			'SELECT SEQ_CODIGO_BILHETE.currval FROM DUAL'
		);  

		const sql = "SELECT CODIGO,NUMERO_BILHETE,TO_CHAR(DATA_CRIACAO, 'YYYY-MM-DD HH24:MI:SS') "+
		            "FROM Bilhetes WHERE SEQ_CODIGO_BILHETE = :0"; //SELECT LAST_NUMBER FROM SEQ_ID_PAIS;
		const dados = [result1];
		ret =  await conexao.execute(sql,dados);
		
		return ret.rows;
	}	
}
	
	/*this.recupereTodos = async function ()
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT Codigo,NUMERO_BILHETE,TO_CHAR(DataEntrada, 'YYYY-MM-DD HH24:MI:SS') "+
		            "FROM Bilhetes";
		ret =  await conexao.execute(sql);

		return ret.rows;
	}
		
	this.recupereUm = async function (codigo)
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT Codigo,NUMERO_BILHETE,TO_CHAR(DataEntrada, 'YYYY-MM-DD HH24:MI:SS') "+
		            "FROM Bilhetes WHERE Codigo=:0";
		const dados = [codigo];
		ret =  await conexao.execute(sql,dados);
		
		return ret.rows;
	}
}
*/

function bilhete (codigo,NUMERO_BILHETE,dataentrada)
{
	    this.codigo = codigo;
	    this.NUMERO_BILHETE   = NUMERO_BILHETE;
	    this.dataentrada  = dataentrada;
}

function Comunicado (codigo,mensagem,descricao,resposta)
{
	this.codigo    = codigo;
	this.mensagem  = mensagem;
	this.descricao = descricao;
	this.resposta = resposta;
}

function middleWareGlobal (req, res, next)
{
    console.time('Requisição'); // marca o início da requisição
    console.log('Método: '+req.method+'; URL: '+req.url); // retorna qual o método e url foi chamada

    next(); // função que chama as próximas ações

    console.log('Finalizou'); // será chamado após a requisição ser concluída

    console.timeEnd('Requisição'); // marca o fim da requisição
}

// para a rota de CREATE
async function inclusao (req, res)
{
    if (!req.body.codigo || !req.body.NUMERO_BILHETE)
    {
        const erro1 = new Comunicado ('DdI','Dados incompletos',
		                  'Não foram informados todos os dados do veículo');
        return res.status(422).json(erro1);
    }
    
    const bilhete = new bilhete (req.body.codigo,req.body.NUMERO_BILHETE,req.body.dataentrada);

    try
    {
      const resultado = await global.Bilhetes.inclua(bilhete);
        const  sucesso = new Comunicado ('IBS','Inclusão bem sucedida', //resposta
		                  'O BILHETE foi incluído com sucesso', resultado);
        return res.status(201).json(sucesso);
	}
	catch (erro)
	{
		console.log('TESTE AQUI');
		const  erro2 = new Comunicado ('LJE','Veículo existente',
		                  'Já há veículo cadastrado com o código informado');
        return res.status(409).json(erro2);
    }
}

// para a primeira rota de READ (todos)
async function recuperacaoDeTodos (req, res)
{
    if (req.body.codigo || req.body.NUMERO_BILHETE || req.body.data)
    {
        const erro = new Comunicado ('JSP','JSON sem propósito',
		             'Foram disponibilizados dados em um JSON sem necessidade');
        return res.status(422).json(erro);
    }
	
    let rec;
	try
	{
	    rec = await global.Bilhetes.recupereTodos();
	}    
    catch(erro)
    {}

	if (rec.length==0)
	{
		return res.status(200).json([]);
	}
	else
	{
		const ret=[];
		for (i=0;i<rec.length;i++) ret.push (new bilhete (rec[i][0],rec[i][1],rec[i][2]));
		return res.status(200).json(ret);
	}
} 

// para a segunda rota de READ (um)
async function recuperacaoDeUm (req, res)
{
    if (req.body.codigo || req.body.NUMERO_BILHETE || req.body.dataentrada)
    {
        const erro1 = new Comunicado ('JSP','JSON sem propósito',
		                  'Foram disponibilizados dados em um JSON sem necessidade');
        return res.status(422).json(erro1);
    }

    const codigo = req.params.codigo;
    
    let ret;
	try
	{
	    ret = await global.Bilhetes.recupereUm(codigo);
	}    
    catch(erro)
    {}

	if (ret.length==0)
	{
		const erro2 = new Comunicado ('LNE','Veículo inexistente',
		                  'Não há veículo cadastrado com o código informado');
		return res.status(404).json(erro2);
	}
	else
	{
		ret = ret[0];
		ret = new bilhete (ret[0],ret[1],ret[2]);
		return res.status(200).json(ret);
	}
}

async function ativacaoDoServidor ()
{
    const bd = new BD ();
	await bd.estrutureSe();
    global.Bilhetes = new Bilhetes (bd);

    const express = require('express');
    const app     = express();
	const cors    = require('cors')
    
    app.use(express.json());   // faz com que o express consiga processar JSON
	app.use(cors()) //habilitando cors na nossa aplicacao (adicionar essa lib como um middleware da nossa API - todas as requisições passarão antes por essa biblioteca).
    app.use(middleWareGlobal); // app.use cria o middleware global

    app.post  ('/gerarbilhete'        , inclusao); //
    //app.get   ('/Bilhetes'        , recuperacaoDeTodos);
    //app.get   ('/Bilhetes/:codigo', recuperacaoDeUm);

    console.log ('Servidor ativo na porta 3000...');
    app.listen(3000);
}

ativacaoDoServidor();