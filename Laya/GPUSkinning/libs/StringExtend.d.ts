declare interface String
{
    format(...args): string;
    format(obj: Object): string;
    eStartsWith(str: string, ignoreCase?: boolean): boolean;
    eEndsWith(str: string, ignoreCase?: boolean): boolean;
    trimLeft(targetString): string;
    trimRight(targetString): string;
    // replaceAll(searchValue, replaceValue): string;

}


declare interface Map<K, V>
{
    getValueOrDefault(key:K, defaultValue?: V):V;
    getKeys(): K[];
    getValues(): V[];
}