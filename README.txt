ABOUT:

Searches a single protein sequence for possible motifs that may elucidate possible function(s) of the protein, or multiple protein sequences for common/shared motifs.

Source code: https://github.com/mytluo/ProteinMotifsSearch
	- Includes SQL file to create the motif database

Results can be used to search annotated protein databases (UniProt, Prosite, Pfam) for possible homologues.

User instructions:

1. Input protein sequence(s) in the search in FASTA format. Queries with invalid IUPAC codes for amino acids or in non-FASTA format will not be accepted.

2. If multiple protein sequences were given, a checkbox menu will be initially generated. Selecting only one protein will return all motifs found for that particular protein. Selecting two or more proteins will return all motifs found in all selected proteins.
 
2. A results table will return motifs found, and where in the sequence they were found. The motifs listed will describe the family they are a part of, the Prosite notation for the general consensus sequence, and any additional information that may be helpful in determining if the match is plausible or valid.

Consensus sequences were derived from:
Aitken, A. (2003). Protein Consensus Sequence Motifs. Protein Sequencing Protocols, 465-485. doi:10.1385/1-59259-342-9:465

