function Food(){
    const _config ={
        selectGId:"",
        loadingId:"",   
        templateId:"",
        containerId:""
    };
    const createFoodList = function(id){
        const tmp = document.getElementById(id);
        if(!tmp)
            return null;
        
        return function(list){
            const addCOunt = 3 - list.length % 3 ; 
            if(addCOunt > 0 && addCOunt !== 3){
                for(let i = 0; i < addCOunt; i ++)
                list.push({
                    PicURL:"",
                    City:"",
                    Town:"",
                    FoodFeature:"",
                    Name:""
                });
            }
            return function(){
                let foodHTML = "";
                list.map((food)=>{
                    const {PicURL ,City,Town,FoodFeature,Name} = food;
                    const introdTmp = document.importNode(tmp.content , true).firstElementChild;
                    if(Name === "" ){
                        introdTmp.innerHTML = " ";
                        container.append(introdTmp);
                        return;
                    }
                    introdTmp.style.cssText = `background-image:linear-gradient(to top, rgba(0, 0, 0, .5),  rgba(255, 255, 255, 0)),url(${PicURL})`;
                    introdTmp.querySelector(".header").textContent = City;
                    introdTmp.querySelector(".country").textContent = Town;
                    introdTmp.querySelector(".shop").textContent = Name;
                    introdTmp.querySelector(".descript").textContent = FoodFeature;
                 
                    foodHTML += introdTmp.outerHTML;
                    
                });

                return foodHTML;
            }
            
        }   
        
             
    }

    const createOptions = function(id) {
        const selectGroup = document.getElementById(id).querySelectorAll("select");
        const sltCityEl = selectGroup[0];
        const sltTown = selectGroup[1];
        return function(key){
            const el = key === "City"? sltCityEl: sltTown;
            const txt = key === "City"? "城市" : "地區";
            el.innerHTML = " ";

            return function(list){
                const defaultValue = list.length !== 0 ?list[0].City:"";
                let optionHTML = new Option(`請選擇${txt}`,defaultValue).outerHTML;
                list.forEach((item , i)=>{
                    const value = item.City+"&"+item[key];
                    optionHTML += new Option(item[key],value).outerHTML;
                }); 

                el.innerHTML = optionHTML;

                return el;
            }
        }       
    }

    this.init = async (config)=>{  
        setConfig(config);     
        const data =  await getFooList();
        const dataControl = selectData(data);
        const dc = dataControl();
        
        const cityList = dc.countryList();
        const optionCreator = createOptions(_config.selectGId);



        const cityEl  = optionCreator("City")(cityList);
        cityEl.addEventListener("change" , (e)=>{
            const container = document.getElementById(_config.containerId);
            container.innerHTML =" "; 
            const target = e.currentTarget;
            const index = target.selectedIndex;
            const cityString = target.options[index].text;
            const list = dc.getFoodList(cityString)();
            optionCreator("Town")(list);
            if(list.length === 0)
                return;
           
            const listHTML = createFoodList(_config.templateId)(list)(); 
            container.innerHTML = listHTML; 
            
        });
        const townEl =document.getElementById(_config.selectGId).querySelectorAll("select")[1];
        townEl.addEventListener("change",(e)=>{
            const container = document.getElementById(_config.containerId);
            container.innerHTML =" "; 
            const target = e.currentTarget;
            const index = target.selectedIndex;
            const townString = target.options[index].text;
            const cityString = target.value.split("&")[0];

            const list = dc.getFoodList(cityString)(townString);
            const listHTML = createFoodList(_config.templateId)(list)(); 
            container.innerHTML = listHTML; 
            createFoodList(list); 
        });

        document.getElementById(_config.loadingId).classList.add("hide");
    };

    function setConfig(config){
        for(key in config){
            _config[key] = config[key];
        }
    }
    async function getFooList(){
        try{
            const dF = await fetch("./assets/db.json");
            if(dF.status !== 200){
                return;
            }
            const result = await dF.json();
            console.log(result);
            return result
        }catch(e){
            console.error(e)
            return null;
        }
    }
   
    function selectData(d){
        const keyCity = "City";
        const keyTown = "Town";
        const filetrTargetColumn = function(d , key){
            return d.filter((item , i ,arr)=>{
                return arr.findIndex((item2 , i)=>{
                    return item[key] === item2[key];
                }) === i;
            });
        }

        const townList = filetrTargetColumn(d ,keyTown);
        const countryList = filetrTargetColumn(townList ,keyCity);
        const getFoodList = (city)=>{
            if(!city || city === "請選擇城市")
                return function(){
                    return [];
                };
            
            return function(town){
                const isTownAll = town === "請選擇地區" || town === undefined;

                return d.filter((item , i)=>{
                    return  item.City === city && (isTownAll || item.Town === town);
                });
            }               
        }
       
        return function(){
            return {
                countryList :function(){
                    return countryList
                },
                townList : function(city){
                    return townList.filter((town)=>{
                        return town.City === city;
                    });
                },
                getFoodList:getFoodList
            }
        }
    }
}