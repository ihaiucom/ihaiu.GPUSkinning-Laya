/*
 * @Descripttion: 
 * @version: 
 * @Author: ZengFeng
 * @Date: 2019-06-27 12:51:19
 * @LastEditors: ZengFeng
 * @LastEditTime: 2019-06-27 12:51:19
 */
String.prototype.format = function (args)
{
    var result = this;
    if (arguments.length > 0)
    {
        if (arguments.length == 1 && typeof (args) == "object")
        {
            for (var key in args)
            {
                if (args[key] != undefined)
                {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else
        {
            for (var i = 0; i < arguments.length; i++)
            {
                if (arguments[i] != undefined)
                {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}



String.format = function () 
{
    if (arguments.length == 0)
        return null;

    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++)
    {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
}

String.prototype.eStartsWith = function (str, ignoreCase)
{
    (ignoreCase===void 0)&& (ignoreCase=false);
    
    var source = this;
    if (!source)
        return source;
        
    else if (source.length < str.length)
        return false;
        
    else 
    {
        source=source.substring(0,str.length);
        if (!ignoreCase)
            return source==str;
        else
            return source.toLowerCase()==str.toLowerCase();
    }
}

String.prototype.eEndsWith = function (str, ignoreCase)
{
    (ignoreCase===void 0)&& (ignoreCase=false);

    var source = this;
    if (!source)
        return false;
    else if (source.length < str.length)
        return false;
    else 
    {
        source=source.substring(source.length-str.length);
        if (!ignoreCase)
            return source==str;
        else
            return source.toLowerCase()==str.toLowerCase();
    }
}

String.prototype.trimLeft = function ()
{
    var targetString = this;
    var tempChar="";
    for (var i=0;i < targetString.length;i++)
    {
        tempChar=targetString.charAt(i);
        if (tempChar !=" " && tempChar !="\n" && tempChar !="\r")
        {
            break ;
        }
    }
    return targetString.substr(i);
}

String.prototype.trimRight = function ()
{
    var targetString = this;
    var tempChar="";
    for (var i=targetString.length-1;i >=0;i--)
    {
        tempChar=targetString.charAt(i);
        if (tempChar !=" " && tempChar !="\n" && tempChar !="\r")
        {
            break ;
        }
    }
    return targetString.substring(0,i+1);
}



// String.prototype.replaceAll = function (searchValue, replaceValue)
// {
//     var reg = new RegExp(searchValue, "g");
//     return this.replace(reg, replaceValue);
// }





Map.prototype.getValueOrDefault = function(key, defaultValue)
{
    var value = this.get(key);
    if(value === undefined || value === null)
    {
        if(defaultValue === undefined)
            return 0;
        return defaultValue;
    }
    return value;
}


Map.prototype.getKeys = function()
{
    var list = [];
    this.forEach((v, k)=>{
        list.push(k);
    });
    return list;
}

Map.prototype.getValues = function()
{
    var list = [];
    this.forEach((v, k)=>{
        list.push(v);
    });
    return list;
}