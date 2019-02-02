const program = require('commander');
// Require logic.js file and extract controller functions using JS destructuring assignment
var request = require("request-promise");
var inquirer = require('inquirer');
var Table = require('cli-table2');
/*

*/



program
  .version('0.0.1')
  .description('Lookup github users repos');

program
  .command('lookup <username>')
  .alias('a')
  .description('Looking up repos of user on github')
  .action((username) => {
    
    
    //Username exists
    function successUserCallback(){

        const questions = [
            {
              type : 'list',
              name : 'choice',
              message : 'Would you like to sort repos by ascending or descening star gazes?',
              choices : ['ascending', 'descending']
            }
          ];

        inquirer.prompt(questions).then(answers => {
            // Use user feedback for... whatever!!

            var table = new Table({
                head: ['Repo Name', 'Star Gazes']
              , colWidths: [50, 15]
            });

            if( answers['choice'] == 'ascending')
            {
                for( var i = 0; i < this.repoArrAscend.length; i++ )
                {
                    table.push(
                        [this.repoArrAscend[i].name , this.repoArrAscend[i].starGazes ]
                    );                
                }

                
            }
            else
            {
                for( var i = 0; i < this.repoArrDescend.length; i++ )
                {
                    table.push(
                        [this.repoArrDescend[i].name, this.repoArrDescend[i].starGazes ]
                    );
                }
            }

            //Print table
            console.log(table.toString());

          });
   
          
    }

    //Username does not exit
    function failedUserCallback(){
        console.warn('Please enter a valid username next time. Killing program...');
        process.exit(0);
    }
    
    var accountObj = new GithubAccount(username);
    accountObj.CreateUser(successUserCallback, failedUserCallback);

    
  });


program.parse(process.argv);

function GithubAccount(username){

    
    this.username = username;
    this.CreateUser = function (successUserCallback, failedUserCallback) {
        
        const options = {  
            uri: "https://api.github.com/users/" + this.username + '/repos',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'node.js'
            }
        };

        request(options).then(function (response) {
            // Request was successful, use the response object at will

            var resJson = JSON.parse(response);

            var repoArr = [];
            for( var i = 0; i < resJson.length; i++ )
            {
                repoArr[i] = new Repo(resJson[i]['name'], resJson[i]['stargazers_count'])
                
            }

            this.repoArrAscend = repoArr.sort();
            this.repoArrDescend = repoArr.slice().reverse();            

            successUserCallback.call(this);
          })
          .catch(function (err) {
            // Something bad happened, handle the error
            console.log(err);
            failedUserCallback.call(this);
          })

        

        
    }
}
class Repo {

    constructor(name, starGazes) {
      this.name = name;
      this.starGazes = starGazes;
    }
  
    static compare(repoA, repoB) {
      return repoA.starGazes - repoB.starGazes;
    }
}