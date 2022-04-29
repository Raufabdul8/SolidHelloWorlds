document.addEventListener('DOMContentLoaded', async function () {
   UI.store.updater.editable = // uri => true // Force modifyable UX // @@@
    function (uri) {
      console.log(' @@ fudging editable for ' + uri)
      return 'SPARQL'
    }

  var dom = document

  /* var uri = window.location.href
  var base = (window.document.title = uri.slice(0, uri.lastIndexOf('/') + 1))
  // var testDocURI = base + 'test.ttl' // imaginary doc - just use its URL
  // const testDocURI = 'https://timbl.com/timbl/Public/Test/Forms/exampleData.ttl'
  const testDocURI = 'https://solidos.solidcommunity.net/public/2021/10_example_data/example.ttl'
  var testDoc = UI.rdf.sym(testDocURI)
  const ex = UI.rdf.Namespace(testDocURI + "#") */

  const defaultProlog = `
  @prefix foaf:  <http://xmlns.com/foaf/0.1/>.
  @prefix sched: <http://www.w3.org/ns/pim/schedule#>.
  @prefix cal:   <http://www.w3.org/2002/12/cal/ical#>.
  @prefix dc:    <http://purl.org/dc/elements/1.1/>.
  @prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#>.
  @prefix ui:    <http://www.w3.org/ns/ui#>.
  @prefix trip:  <http://www.w3.org/ns/pim/trip#>.
  @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  @prefix xsd:   <http://www.w3.org/2001/XMLSchema#>.
  @prefix : <#>.
  `
  //@prefix ex: <#>.  # Things in the examples

  // var div = dom.getElementById('UITestArea')

  const getOptions = {
    credentials: 'omit', withCredentials: false
  }

  function output (row) {
    return row.children[1]
  }
  
  function renderForm (form, subject, container) {
    async function callback() {
    }
    const doc = subject.doc()

    var ele =  UI.widgets.appendForm(dom, container, {}, subject, form, doc, callback)
    return ele
  }

  /* For loading eg ontologies from w3.org
  */
  function addStoHTTP (str) {
    if (str.startsWith('http:')) {
      return 'https:' + str.slice(5)
    }
    return str
  }

  async function doRow (prolog, row) {

    async function loadTextIntoCell (cell) {
      const source = cell.getAttribute('source')
      if (!source) return
      const response = await UI.store.fetcher.webOperation('GET', addStoHTTP(source), getOptions)
      if (!response.ok) { // if HTTP-status is 200-299
        const msg = "HTTP-Error: " + response.status
        cell.textContent = msg
        cell.style.backgroundColor = '#fee'
        alert(msg);
        return
      }
      const text = response.responseText;
      const pre = dom.createElement('pre')
      cell.appendChild(pre)
      pre.textContent = text
    }

    const cellForClass = []

    // UI.store.removeMany(null, null, null, testDoc) // Remove previous test data


    for (var cell of row.children) {
      await loadTextIntoCell(cell)
      if (cell.getAttribute('class')) {
        for (const c of cell.getAttribute('class').split(' ')) {
          cellForClass[c] = cell
          console.log('   cellForClass: ' + c)
        }
      }
    }
    const inputCell = cellForClass['input']
    const targetCell  = cellForClass['target']
    const outputCell = cellForClass['output']

    const inputText = inputCell.firstElementChild.textContent
    console.log(inputText)
    if (inputCell.getAttribute('source')) {
      form = UI.rdf.sym(inputCell.getAttribute('source'))
    }
    /* else {
      form = ex('form')
    } */
    if (targetCell.getAttribute('source')) {
      subject = UI.rdf.sym(targetCell.getAttribute('source'))
    }
    /* else {
      subject = ex('this')
    } */

    // const linkToForm = "https://timea.solidcommunity.net/HelloWorld/components/helloWorldForm.ttl#this"
    //form = UI.rdf.sym(linkToForm)
    await UI.store.fetcher.load(form.doc().uri)


    //const linkToSolidExampleKnowledgeGraph = "https://timea.solidcommunity.net/HelloWorld/data/helloWorld.ttl#0data-Solid-Hello-World"
    //subject = UI.rdf.sym(linkToSolidExampleKnowledgeGraph)
    await UI.store.fetcher.load(subject.doc().uri)
    
    renderForm(form, subject, outputCell)
  }
  async function showResults () {
    var prologEle = dom.getElementById('Prolog')
    const prolog = defaultProlog + (prologEle ? prologEle.textContent : "")

    const testRows = dom.getElementsByClassName('form-demo')
    for (var row of testRows) {
      await doRow(prolog, row)
    }
    if (dom.getElementById('TestData')) {
      for (var row of dom.getElementById('TestData').children) {
        await doRow(prolog, row)
      }
    }
  } // showResults

  try {
    // await UI.store.fetcher.load(testDoc) // To fool the form syt
  } catch (err) {
    console.warn(err)
  }
  await showResults()
})
