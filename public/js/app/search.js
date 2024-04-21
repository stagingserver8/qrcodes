
var searchUri = 'person'
$("#search").on('change keyup paste', function () {

   search()
});

$(document).ready(function (e) {
   $("#search_results").hide() 
});
$("#search_div_close").click(  function () {
   $("#search_results").hide() 
});


function search() {
   var searchQuery = $("#search").val()
   if (searchQuery.length < 2) {
      $("#search_results").hide()
      return
   }

   searchUri = $('#search_entity').val() 
   get(`${searchUri}/search?query=${searchQuery}`, function (err, data) {
      $("#search_results").show()
      $("#search_item").empty()
      console.log(data)
      if (data.data.length > 0) {
         data.data.forEach(element => {
            $("#search_item").append(appendResults(searchUri, element))
         });
         return
      }
      $("#search_item").append(`<div class="list-group-item">
      <div class="row align-items-center">
        <div class="col-auto">
          <span class="status-dot status-dot-animated bg-red d-block"></span></div>
        <div class="col text-truncate">
           <div class="d-block text-muted text-truncate mt-n1">
        No search results were found
          </div>
        </div>
         
      </div>
    </div>`)
      // toastr.success(data.message)

   })
}


function appendResults(searchUri, data) {

   switch (searchUri) {
      case 'person':
         return `<div class="list-group-item">
         <div class="row align-items-center">
           <div class="col-auto">
             <span class="status-dot status-dot-animated bg-red d-block"></span></div>
           <div class="col text-truncate">
             <a href="people?id=${data.personId}"  
             class="text-body d-block">${data.name}</a>
             <div class="d-block text-muted text-truncate mt-n1">
             Works At: <a href="companies?id=${data.company.companyId}" >${data.company.name}</a>
             </div>
           </div>
            
         </div>
       </div>`
      case 'company':
         return `<div class="list-group-item">
         <div class="row align-items-center">
           <div class="col-auto">
             <span class="status-dot status-dot-animated bg-red d-block"></span></div>
           <div class="col text-truncate">
             <a href="companies?id=${data.companyId}"  
             class="text-body d-block">${data.name}</a>
             <div class="d-block text-muted text-truncate mt-n1">
             Sector: ${data.sector} 
             </div>
           </div>
            
         </div>
       </div>`
      case 'investor':
         return `<div class="list-group-item">
         <div class="row align-items-center">
           <div class="col-auto">
             <span class="status-dot status-dot-animated bg-red d-block"></span></div>
           <div class="col text-truncate">
             <a href="investors?id=${data.investorId}"  
             class="text-body d-block">${data.name}</a>
             <div class="d-block text-muted text-truncate mt-n1">
             Geo Focus: ${data.geoFocus} ,Sector Focus:  ${data.sectorFocus}
             </div>
           </div>
            
         </div>
       </div>`
      case 'deal':
         return `<div class="list-group-item">
         <div class="row align-items-center">
           <div class="col-auto">
             <span class="status-dot status-dot-animated bg-red d-block"></span></div>
           <div class="col text-truncate">
             <a href="deals?id=${data.dealId}"  
             class="text-body d-block">${data.company.name}</a>
             <div class="d-block text-muted text-truncate mt-n1">
            Value:$M${data.value}  
             </div>
           </div>
            
         </div>
       </div>`

      case 'event':
         return `<div class="list-group-item">
         <div class="row align-items-center">
           <div class="col-auto">
             <span class="status-dot status-dot-animated bg-red d-block"></span></div>
           <div class="col text-truncate">
             <a href="events?id=${data.eventId}"  
             class="text-body d-block">${data.name}</a>
             <div class="d-block text-muted text-truncate mt-n1">
            From:  ${moment(data.from).format('YYYY-MM-DD')}     To:  ${moment(data.to).format('YYYY-MM-DD')}  
             </div>
           </div>
            
         </div>
       </div>`

      case 'news':
         return `<div class="list-group-item">
         <div class="row align-items-center">
           <div class="col-auto">
             <span class="status-dot status-dot-animated bg-red d-block"></span></div>
           <div class="col text-truncate">
             <a href="news?id=${data.newsId}"  
             class="text-body d-block">${data.title}</a>
             <div class="d-block text-muted text-truncate mt-n1">
            Source:  ${data.source}  
             </div>
           </div>
            
         </div>
       </div>`

      default:
         `<div class="list-group-item">
         <div class="row align-items-center">
           <div class="col-auto">
             <span class="status-dot status-dot-animated bg-red d-block"></span></div>
           <div class="col text-truncate">
              <div class="d-block text-muted text-truncate mt-n1">
           No search results were found
             </div>
           </div>
            
         </div>
       </div>`
   }

}