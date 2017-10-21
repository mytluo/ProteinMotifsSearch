#!/usr/local/bin/python3

import cgi, json
import os, re
import mysql.connector

def main():
    print("Content-Type: application/json\n\n")
    form = cgi.FieldStorage()
    input = form.getvalue('search_term') 

    fasta = re.compile(r">(.+)\n([[A-Y\n]+)", re.I)
    prots = re.findall(fasta, input)

    conn = mysql.connector.connect(user='guest', password='abc123', host='localhost', database='motifs')
    cursor = conn.cursor()

    results = dict()
    # append each SQL statement to be execute to a list
    for term in prots:
        seq = term[1].replace("\n", "").upper()
        sql = ["""DROP TEMPORARY TABLE IF EXISTS query"""]
        sql.append("""CREATE TEMPORARY TABLE query (protein varchar(1000) NOT NULL)""")
        sql.append("""INSERT INTO query VALUE ("%s")""" % seq)
        sql.append("""SELECT ID, motif, subtype, prosite, regex, notes FROM motifs.protein_motifs INNER JOIN query ON (query.protein REGEXP protein_motifs.regex)""")

        # execute each statement in sql list
        for stmt in sql:
            cursor.execute(stmt)

        res = {'sequence': seq, 'matches': 0, 'sites': dict()}
        for (ID, motif, subtype, prosite, regex, notes) in cursor:
            res['sites'][ID] = {'motif': motif, 'type': subtype, 'pattern': prosite, 'regex': regex, 'notes': notes}
            res['matches'] += 1
        results[term[0]] = res

    conn.close()
    print(json.dumps(results))

if __name__ == '__main__':
    main()

